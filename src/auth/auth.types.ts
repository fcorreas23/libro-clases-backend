export type AuthenticatedUser = {
  sub: number;
  email: string;
  roles: string[];
  teacherId: number | null;
};
