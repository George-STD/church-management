export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: any;
  token?: string;
  errors?: { path: string; message: string }[];
}

const BASE_URL = '/api';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('church_token');
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'حدث خطأ في الاتصال بالخادم');
      }

      return data;
    } catch (err: any) {
      console.error(`API Error on ${endpoint}:`, err.message);
      throw err;
    }
  }

  // ---------------- Auth ----------------
  async login(identifier: string, password: string) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    if (res.token) {
      localStorage.setItem('church_token', res.token);
    }
    return res;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async logout() {
    localStorage.removeItem('church_token');
    return this.request('/auth/logout', { method: 'POST' });
  }

  // ---------------- Hierarchy ----------------
  async getSectorsWithStages() {
    return this.request('/hierarchy/sectors');
  }

  async getStages() {
    return this.request('/hierarchy/stages');
  }

  // ---------------- Servants ----------------
  async getServants(params?: { stageId?: string }) {
    const q = params?.stageId ? `?stageId=${params.stageId}` : '';
    return this.request(`/servants${q}`);
  }

  async getServantById(id: string) {
    return this.request(`/servants/${id}`);
  }

  async updateOwnProfile(profileData: any) {
    return this.request('/servants/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updateServantEvaluation(servantId: string, evaluation: any) {
    return this.request(`/servants/${servantId}/evaluation`, {
      method: 'PUT',
      body: JSON.stringify(evaluation),
    });
  }

  async createServant(servantData: any) {
    return this.request('/servants', {
      method: 'POST',
      body: JSON.stringify(servantData),
    });
  }

  async transferServant(servantId: string, payload: { toStageId?: string; toSectorId?: string; reason?: string }) {
    return this.request(`/servants/${servantId}/transfer`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async suspendServant(servantId: string, payload: { status: string; reason?: string }) {
    return this.request(`/servants/${servantId}/suspend`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ---------------- Members ----------------
  async getMembers(params?: { stageId?: string; assignedOnly?: boolean; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.stageId) searchParams.append('stageId', params.stageId);
    if (params?.assignedOnly) searchParams.append('assignedOnly', 'true');
    if (params?.search) searchParams.append('search', params.search);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/members${qs}`);
  }

  async getMemberById(id: string) {
    return this.request(`/members/${id}`);
  }

  async createMember(memberData: any) {
    return this.request('/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  async updateMember(id: string, memberData: any) {
    return this.request(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  }

  async updateMemberEvaluation(id: string, evaluation: any) {
    return this.request(`/members/${id}/evaluation`, {
      method: 'PUT',
      body: JSON.stringify(evaluation),
    });
  }

  async bulkImportMembers(stageId: string, members: any[]) {
    return this.request('/members/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ stageId, members }),
    });
  }

  // ---------------- Follow-Up & Attendance ----------------
  async getSessions(stageId?: string) {
    const q = stageId ? `?stageId=${stageId}` : '';
    return this.request(`/follow-up/sessions${q}`);
  }

  async createSession(sessionData: any) {
    return this.request('/follow-up/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async getSessionRecords(sessionId: string) {
    return this.request(`/follow-up/sessions/${sessionId}/records`);
  }

  async recordAttendance(sessionId: string, records: any[]) {
    return this.request('/follow-up/records', {
      method: 'POST',
      body: JSON.stringify({ sessionId, records }),
    });
  }

  async getAbsenceAlerts() {
    return this.request('/follow-up/alerts');
  }

  async resolveAbsenceAlert(alertId: string) {
    return this.request(`/follow-up/alerts/${alertId}/resolve`, {
      method: 'POST',
    });
  }

  // ---------------- Lesson Prep ----------------
  async getPreps(stageId?: string) {
    const q = stageId ? `?stageId=${stageId}` : '';
    return this.request(`/prep${q}`);
  }

  async createPrep(prepData: any) {
    return this.request('/prep', {
      method: 'POST',
      body: JSON.stringify(prepData),
    });
  }

  async reviewPrep(prepId: string, reviewData: { status: string; feedback?: string }) {
    return this.request(`/prep/${prepId}/review`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  // ---------------- Spiritual Life Vault ----------------
  async getSpiritualEntries() {
    return this.request('/spiritual');
  }

  async logSpiritualEntry(entry: any) {
    return this.request('/spiritual', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  // ---------------- Year Plan ----------------
  async getYearPlanItems() {
    return this.request('/year-plan');
  }

  async createYearPlanItem(item: any) {
    return this.request('/year-plan', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async signupForPlanItem(itemId: string, roleNotes?: string) {
    return this.request(`/year-plan/${itemId}/signup`, {
      method: 'POST',
      body: JSON.stringify({ roleNotes }),
    });
  }

  // ---------------- Announcements ----------------
  async getAnnouncements() {
    return this.request('/announcements');
  }

  async createAnnouncement(announcement: any) {
    return this.request('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcement),
    });
  }

  async markAnnouncementRead(id: string) {
    return this.request(`/announcements/${id}/read`, {
      method: 'POST',
    });
  }

  // ---------------- Analytics ----------------
  async getDashboardAnalytics() {
    return this.request('/analytics/dashboard');
  }

  // ---------------- Reports ----------------
  getExportMembersExcelUrl(stageId?: string) {
    return `/api/reports/members/excel${stageId ? `?stageId=${stageId}` : ''}`;
  }
}

export const api = new ApiService();
