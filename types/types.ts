export interface Store {
  _id: string;
  name: string;
  parentStore?: string;
  image?: string;
}

export interface Category {
  _id: string;
  name: string;
  image?: string;
  store?: string;
}

export interface Item {
  _id: string;
  name: string;
  description: string;
  condition: string;
  quantity: number;
  category?: string;
  image?: string;
}

export interface Issue {
  _id: string;
  item: string;
  name: string;
  date: string;
  quantity: number;
  approvingAuthority: string;
  category: string;
  issueTime: string;
  condition: string;
  issued_to?: string;
}