import { getApiBaseUrl } from './apiConfig';

export type SpecialPartner = {
  id: string;
  name: string;
  category: string;
  city: string;
  shortDescription: string;
  badge: string;
  featuredImage: string;
  rating: number;
};

export type SpecialPartnersResponse = {
  items: SpecialPartner[];
};

export async function getSpecialPartners(): Promise<SpecialPartnersResponse> {
  const res = await fetch(`${getApiBaseUrl()}/public-api/special-partners/`);
  if (!res.ok) {
    throw new Error('Αποτυχία φόρτωσης special partners');
  }
  return res.json();
}
