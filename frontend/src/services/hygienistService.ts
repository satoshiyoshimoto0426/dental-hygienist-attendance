import apiClient from './api';
import { Hygienist, CreateHygienistRequest, UpdateHygienistRequest } from '../types/Hygienist';
import { ApiResponse } from '../types/Api';

export class HygienistService {
  // 歯科衛生士一覧取得
  static async getHygienists(): Promise<Hygienist[]> {
    try {
      const response = await apiClient.get<ApiResponse<Hygienist[]>>('/hygienists');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || '歯科衛生士一覧の取得に失敗しました');
    }
  }

  // 歯科衛生士詳細取得
  static async getHygienist(id: number): Promise<Hygienist> {
    try {
      const response = await apiClient.get<ApiResponse<Hygienist>>(`/hygienists/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || '歯科衛生士情報の取得に失敗しました');
    }
  }

  // 歯科衛生士登録
  static async createHygienist(hygienistData: CreateHygienistRequest): Promise<Hygienist> {
    try {
      const response = await apiClient.post<ApiResponse<Hygienist>>('/hygienists', hygienistData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || '歯科衛生士の登録に失敗しました');
    }
  }

  // 歯科衛生士更新
  static async updateHygienist(id: number, hygienistData: Partial<CreateHygienistRequest>): Promise<Hygienist> {
    try {
      const response = await apiClient.put<ApiResponse<Hygienist>>(`/hygienists/${id}`, hygienistData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || '歯科衛生士情報の更新に失敗しました');
    }
  }

  // 歯科衛生士削除
  static async deleteHygienist(id: number): Promise<void> {
    try {
      await apiClient.delete(`/hygienists/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || '歯科衛生士の削除に失敗しました');
    }
  }
}