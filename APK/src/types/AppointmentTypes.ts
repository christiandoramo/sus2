export interface AppointmentProps {
    id: string;
    date: string;
    specialty: string;
    doctorName: string;
    latitude: string;
    longitude: string;
    status: string;
    attachments?: string;
    observation: string;
  }

export interface CustomFile {
    uri: string;
    name: string;
    type: string;
  };