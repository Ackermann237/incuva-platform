// src/services/messaging.js

const API_BASE = '/api/messaging';

export async function getInbox() {
  try {
    const response = await fetch(`${API_BASE}/inbox`, {
      method: 'GET',
      credentials: 'include'
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching inbox:', error);
    return { success: false, error: error.message };
  }
}

export async function getConversation(chatId) {
  try {
    const response = await fetch(`${API_BASE}/conversation/${chatId}`, {
      method: 'GET',
      credentials: 'include'
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return { success: false, error: error.message };
  }
}

export async function getVideoToken(interviewId) {
  try {
    const response = await fetch(`${API_BASE}/get_video_token/${interviewId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching video token:", error);
    return { success: false, error: error.message };
  }
}

export async function sendMessage(chatId, content, receiverId) {
  try {
    const response = await fetch(`${API_BASE}/send_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        chat_id: chatId,
        content: content,
        receiver_id: receiverId
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: error.message };
  }
}

export async function sendFile(chatId, receiverId, file, fileType) {
  try {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('receiver_id', receiverId);
    formData.append('file_type', fileType);
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/send_file`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      // NE RIEN METTRE ICI POUR Content-Type !
      // Le navigateur doit ajouter : multipart/form-data; boundary=...
    });

    // Gestion d'erreur plus claire
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erreur serveur:", errorData);
      return { success: false, error: errorData.error || `HTTP ${response.status}` };
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending file:', error);
    return { success: false, error: error.message };
  }
}

export async function startConversation(candidateId, jobId) {
  try {
    const response = await fetch(`${API_BASE}/start_conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        candidate_id: candidateId,
        job_id: jobId
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Error starting conversation:', error);
    return { success: false, error: error.message };
  }
}

export async function scheduleInterview(formData) {
  try {
    const response = await fetch(`${API_BASE}/schedule_interview`, {
      method: 'POST',
      credentials: 'include',
      body: formData // FormData avec tous les champs
    });
    return await response.json();
  } catch (error) {
    console.error('Error scheduling interview:', error);
    return { success: false, error: error.message };
  }
}

export async function getInterviewDetails(interviewId) {
  try {
    const response = await fetch(`${API_BASE}/interview_details/${interviewId}`, {
      method: 'GET',
      credentials: 'include'
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching interview details:', error);
    return { success: false, error: error.message };
  }
}

export async function cancelInterview(interviewId, chatId, userId) {
  try {
    const response = await fetch(`${API_BASE}/cancel_interview/${interviewId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Error canceling interview:', error);
    return { success: false, error: error.message };
  }
}

export async function markCandidateNotSelected(interviewId, chatId, userId) {
  try {
    const response = await fetch(`${API_BASE}/mark_candidate_not_selected/${interviewId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Error marking candidate as not selected:', error);
    return { success: false, error: error.message };
  }
}

export async function saveEvaluation(interviewId, evaluationData) {
  try {
    const response = await fetch(`${API_BASE}/save_evaluation/${interviewId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(evaluationData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error saving evaluation:', error);
    return { success: false, error: error.message };
  }
}