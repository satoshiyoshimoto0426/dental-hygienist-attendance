import apiClient from './api';
import { Patient, CreatePatientRequest } from '../types/Patient';
import { ApiResponse } from '../types/Api';

export class PatientService {
  // 患者一覧取得
  static async getPatients(): Promise<Patient[]> {
    try {
      const response = await apiClient.get<ApiResponse<Patient[]>>('/patients');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || '患者一覧の取得に失敗しました');
    }
  }

  // 患者詳細取得
  static async getPatient(id: number): Promise<Patient> {
    try {
      const response = await apiClient.get<ApiResponse<Patient>>(`/patients/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || '患者情報の取得に失敗しました');
    }
  }

  // 患者登録
  static async createPatient(patientData: CreatePatientRequest): Promise<Patient> {
    try {
      const response = await apiClient.post<ApiResponse<Patient>>('/patients', patientData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || '患者の登録に失敗しました');
    }
  }

  // 患者更新
  static async updatePatient(id: number, patientData: Partial<CreatePatientRequest>): Promise<Patient> {
    try {
      const response = await apiClient.put<ApiResponse<Patient>>(`/patients/${id}`, patientData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || '患者情報の更新に失敗しました');
    }
  }

  // 患者削除
  static async deletePatient(id: number): Promise<void> {
    try {
      await apiClient.delete(`/patients/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || '患者の削除に失敗しました');
    }
  }
}