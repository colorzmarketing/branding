import { getCompanies, getCompanyGatheringMap } from "@/lib/actions/companies";
import CompanyBoard from "@/components/companies/CompanyBoard";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const [companies, gatheringMap] = await Promise.all([
    getCompanies(),
    getCompanyGatheringMap(),
  ]);
  return <CompanyBoard companies={companies} gatheringMap={gatheringMap} />;
}
