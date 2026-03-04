export type DevAccount = {
  label: string;
  email: string;
  password: string;
};

export const devAccounts: DevAccount[] = [
  {
    label: "Admin",
    email: "admin@ieltshabib.com",
    password: "dev$IELTSHabib.hr7",
  },
  {
    label: "Instructor",
    email: "mdhabibur.hr7@gmail.com",
    password: "password123",
  },
  {
    label: "Student",
    email: "next.level.english.bd@gmail.com",
    password: "next.level.english.bd@gmail.com",
  },
];
