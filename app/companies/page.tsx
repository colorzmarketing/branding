import { getCompanies } from "@/lib/actions/companies";
import CompanyBoard from "@/components/companies/CompanyBoard";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await getCompanies();
  return <CompanyBoard companies={companies} />;
}
