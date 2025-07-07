export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface QuestionnaireAnswers {
  questionId: string;
  answer: string;
}

export interface AccessPermission {
  module: string;
  access: boolean;
}

export interface Profile {
  id: string;
  gender?: number;
  birthDate?: string;
  phoneNumber?: string;
  address?: Address;
  firstName?: string;
  userName?: string;
  updatedAt?: string;
  questionnaireAnswers: QuestionnaireAnswers[];
  packageTier?: number;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  accessPermissions: AccessPermission[];
  lastName?: string;
  profession?: string;
  physicalActivities: string[];
  mentalActivities: string[];
  height?: number;
  weight?: number;
  hobbies: string[];
}
