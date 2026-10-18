// Job: read Eileen's footer identity from env (placeholders everywhere except production).
export type Business = {
  chefLine: string;
  addressLines: string[];
  phone: string;
  email: string;
};

export function getBusiness(): Business {
  return {
    chefLine: process.env.BUSINESS_CHEF_LINE ?? "",
    addressLines: (process.env.BUSINESS_ADDRESS_LINES ?? "").split("|").filter(Boolean),
    phone: process.env.BUSINESS_PHONE ?? "",
    email: process.env.BUSINESS_EMAIL ?? "",
  };
}
