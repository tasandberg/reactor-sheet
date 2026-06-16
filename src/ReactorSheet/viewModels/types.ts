export interface IdentityVM {
  name: string;
  img: string;
  classLabel: string;
  level: number;
  alignment: string;
  title: string;
}

export interface VitalsVM {
  hp: { value: number; max: number };
  ac: { ascending: number; descending: number };
  initMod: number;
  hd: string;
  move: number;
}
