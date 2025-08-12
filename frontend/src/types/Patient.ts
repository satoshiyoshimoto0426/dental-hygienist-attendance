export interface Patient {
  id: number;
  patientId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePatientRequest {
  patientId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {
  id: number;
}