import ProfileCard from "../components/ProfileCard";
import BalanceCard from "../components/BalanceCard";
import SpendingCard from "../components/SpendingCard";
import GoalsCard from "../components/GoalsCard";
import Transactions from "../components/Transactions";
import NetWorthChart from "../components/NetWorthChart";
import TopSearch from "../components/TopSearch";
import CalendarCard from "../components/CalendarCard";
import QuickActions from "../components/QuickActions";

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f5f8ff] via-[#eef3ff] to-[#f8faff] p-10">
            <div className="max-w-7xl mx-auto">

                {/* SEARCH BAR */}
                <TopSearch />

                <div className="grid grid-cols-12 gap-8">

                    {/* ROW 1 */}
                    <div className="col-span-3">
                        <ProfileCard />
                    </div>

                    <div className="col-span-6">
                        <BalanceCard />
                    </div>

                    <div className="col-span-3">
                        <CalendarCard />
                    </div>

                    {/* ROW 2 */}
                    <div className="col-span-9">
                        <NetWorthChart />
                    </div>

                    <div className="col-span-3 row-span-2 flex flex-col gap-6">
                        <SpendingCard />
                        <QuickActions />
                    </div>


                    {/* ROW 3 */}
                    <div className="col-span-3">
                        <GoalsCard />
                    </div>

                    <div className="col-span-6">
                        <Transactions />
                    </div>



                </div>
            </div>
        </div>
    );
}
