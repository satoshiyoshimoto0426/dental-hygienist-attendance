export interface Hygienist {
  id: number;
  staffId: string;
  name: string;
  licenseNumber?: string;
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHygienistRequest {
  staffId: string;
  name: string;
  licenseNumber?: string;
  phone?: string;
  email?: string;
}

export interface UpdateHygienistRequest extends Partial<CreateHygienistRequest> {
  id: number;
}