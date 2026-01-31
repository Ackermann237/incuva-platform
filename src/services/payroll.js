// services/payroll.js
const API_BASE_URL = '/api/payroll';

/**
 * Récupérer les employés pour la paie
 */
export async function getEmployeesForPayroll() {
  try {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la récupération des employés'
      };
    }

    return {
      success: true,
      employees: data.employees || []
    };
  } catch (error) {
    console.error('Erreur getEmployeesForPayroll:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer les bulletins de paie
 */
export async function getPayslips(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/payslips?${queryString}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la récupération des bulletins'
      };
    }

    return {
      success: true,
      payslips: data.payslips || []
    };
  } catch (error) {
    console.error('Erreur getPayslips:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer les détails d'un bulletin
 */
export async function getPayslipDetail(payslipId) {
  try {
    const response = await fetch(`${API_BASE_URL}/payslip/${payslipId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la récupération du bulletin'
      };
    }

    return {
      success: true,
      payslip: data.payslip
    };
  } catch (error) {
    console.error('Erreur getPayslipDetail:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Générer un nouveau bulletin de paie
 */
export async function generatePayslip(payslipData) {
  try {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payslipData)
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la génération du bulletin'
      };
    }

    return {
      success: true,
      message: data.message,
      payslipId: data.payslip_id,
      payslipNumber: data.payslip_number
    };
  } catch (error) {
    console.error('Erreur generatePayslip:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mettre à jour un bulletin de paie
 */
export async function updatePayslip(payslipId, updateData) {
  try {
    const response = await fetch(`${API_BASE_URL}/payslip/${payslipId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updateData)
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la mise à jour du bulletin'
      };
    }

    return {
      success: true,
      message: data.message
    };
  } catch (error) {
    console.error('Erreur updatePayslip:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Approuver un bulletin de paie
 */
export async function approvePayslip(payslipId) {
  try {
    const response = await fetch(`${API_BASE_URL}/payslip/${payslipId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de l\'approbation du bulletin'
      };
    }

    return {
      success: true,
      message: data.message
    };
  } catch (error) {
    console.error('Erreur approvePayslip:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Marquer un bulletin comme payé
 */
export async function markPayslipAsPaid(payslipId) {
  try {
    const response = await fetch(`${API_BASE_URL}/payslip/${payslipId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors du marquage comme payé'
      };
    }

    return {
      success: true,
      message: data.message
    };
  } catch (error) {
    console.error('Erreur markPayslipAsPaid:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer les statistiques de la paie
 */
export async function getPayrollStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la récupération des statistiques'
      };
    }

    return {
      success: true,
      stats: data.stats || {}
    };
  } catch (error) {
    console.error('Erreur getPayrollStats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Exporter les données de paie
 */
export async function exportPayrollData(format = 'json') {
  try {
    const response = await fetch(`${API_BASE_URL}/export/${format}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de l\'export'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('Erreur exportPayrollData:', error);
    return { success: false, error: error.message };
  }
}

export async function getCompanyInfo() {
  try {
    const response = await fetch(`${API_BASE_URL}/company/info`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la récupération des informations de l\'entreprise'
      };
    }

    return {
      success: true,
      company: data.company || {}
    };
  } catch (error) {
    console.error('Erreur getCompanyInfo:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer les informations complètes d'un employé
 */
export async function getEmployeeCompleteInfo(employeeId) {
  try {
    const response = await fetch(`${API_BASE_URL}/employee/${employeeId}/complete`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la récupération des informations de l\'employé'
      };
    }

    return {
      success: true,
      employee: data.employee || {}
    };
  } catch (error) {
    console.error('Erreur getEmployeeCompleteInfo:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Configurer la paie automatique pour un employé
 */
export async function setupAutoPayroll(employeeId, configData) {
  try {
    const response = await fetch(`${API_BASE_URL}/auto_setup/${employeeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(configData)
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la configuration automatique'
      };
    }

    return {
      success: true,
      message: data.message
    };
  } catch (error) {
    console.error('Erreur setupAutoPayroll:', error);
    return { success: false, error: error.message };
  }
}

// Ajoutez cette fonction dans services/payroll.js
/**
 * Récupérer tous les bulletins pour l'analyse IA
 */
export async function getAllPayslipsForAI() {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/all-payslips`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la récupération des bulletins pour IA'
      };
    }

    return {
      success: true,
      payslips: data.payslips || []
    };
  } catch (error) {
    console.error('Erreur getAllPayslipsForAI:', error);
    return { success: false, error: error.message };
  }
}

// Mettez à jour la fonction analyzePayrollWithAI :
export async function analyzePayrollWithAI(payrollData) {
  try {
    // Récupérer tous les bulletins pour l'analyse IA
    const allPayslipsRes = await getAllPayslipsForAI();

    if (!allPayslipsRes.success) {
      return { success: false, error: 'Impossible de récupérer les bulletins pour analyse' };
    }

    const response = await fetch('/api/payroll/ai/analyze_payroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        payroll_data: {
          ...payrollData,
          all_payslips: allPayslipsRes.payslips // Ajouter tous les bulletins
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de l\'analyse IA'
      };
    }

    return {
      success: true,
      analysis: data.analysis
    };
  } catch (error) {
    console.error('Erreur analyzePayrollWithAI:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Interroger l'IA sur des questions spécifiques concernant la paie
 */
export async function queryPayrollAI(question, payrollData) {
  try {
    const response = await fetch('/api/payroll/ai/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        question,
        context: {
          payslips_count: payrollData?.payslips?.length || 0,
          employees_count: payrollData?.employees?.length || 0,
          stats: payrollData?.stats || {}
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Erreur lors de la requête IA'
      };
    }

    return {
      success: true,
      answer: data.answer
    };
  } catch (error) {
    console.error('Erreur queryPayrollAI:', error);
    return { success: false, error: error.message };
  }
}

export default {
  getEmployeesForPayroll,
  getPayslips,
  getPayslipDetail,
  generatePayslip,
  updatePayslip,
  approvePayslip,
  markPayslipAsPaid,
  getPayrollStats,
  exportPayrollData,
  analyzePayrollWithAI,
  getEmployeeCompleteInfo,
  getCompanyInfo,
  setupAutoPayroll,
  queryPayrollAI
};