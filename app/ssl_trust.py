"""Fait confiance aux certificats du magasin Windows pour les appels HTTPS/gRPC vers Google.

requests (certifi) et gRPC n'utilisent pas le magasin de certificats de l'OS. Derrière un antivirus ou un proxy
qui inspecte le HTTPS, la vérification échoue alors avec « unable to get local issuer certificate ».
On génère donc un bundle = certifi + magasin Windows et on l'indique via les variables d'environnement standard.
À importer avant toute bibliothèque réseau.
"""
import logging
import os
import ssl
import sys
import tempfile

logger = logging.getLogger(__name__)

BUNDLE_ENV_VARS = ('REQUESTS_CA_BUNDLE', 'SSL_CERT_FILE', 'GRPC_DEFAULT_SSL_ROOTS_FILE_PATH')


def use_system_certificates():
    if sys.platform != 'win32' or os.getenv('INCUVA_SKIP_SYSTEM_CERTS'):
        return

    pems = []
    try:
        import certifi
        with open(certifi.where(), encoding='utf-8') as f:
            pems.append(f.read())
    except Exception as e:  # certifi absent : on se contentera du magasin Windows
        logger.warning("certifi indisponible : %s", e)

    for store in ('ROOT', 'CA'):
        try:
            for cert, encoding, _trust in ssl.enum_certificates(store):
                if encoding == 'x509_asn':
                    pems.append(ssl.DER_cert_to_PEM_cert(cert))
        except OSError as e:
            logger.warning("Lecture du magasin Windows %s impossible : %s", store, e)

    if not pems:
        return

    try:
        path = os.path.join(tempfile.gettempdir(), 'incuva_ca_bundle.pem')
        with open(path, 'w', encoding='ascii') as f:
            f.write('\n'.join(pems))
    except OSError as e:
        logger.warning("Bundle de certificats non écrit : %s", e)
        return

    for var in BUNDLE_ENV_VARS:
        os.environ.setdefault(var, path)


def relax_strict_verification():
    """Python 3.13+ / urllib3 activent VERIFY_X509_STRICT, que rejettent les certificats racine des outils
    d'inspection HTTPS (« Basic Constraints of CA cert not marked critical »).
    On ne retire que ce mode strict : la chaîne de confiance et le nom d'hôte restent vérifiés."""
    strict = getattr(ssl, 'VERIFY_X509_STRICT', 0)
    if sys.platform != 'win32' or not strict or os.getenv('INCUVA_SKIP_SYSTEM_CERTS'):
        return
    try:
        import urllib3.connection
        import urllib3.util
        import urllib3.util.ssl_ as ssl_util
    except ImportError:
        return

    original = ssl_util.create_urllib3_context

    def create_urllib3_context(*args, **kwargs):
        context = original(*args, **kwargs)
        context.verify_flags &= ~strict
        return context

    ssl_util.create_urllib3_context = create_urllib3_context
    urllib3.util.create_urllib3_context = create_urllib3_context
    urllib3.connection.create_urllib3_context = create_urllib3_context


use_system_certificates()
relax_strict_verification()
