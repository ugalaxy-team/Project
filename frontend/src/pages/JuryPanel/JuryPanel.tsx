import type { RootState } from "@/store";
import { useSelector } from "react-redux";
import TournamentCard from "./components/TournamentCard";

const JuryPanel = () => {
    const user = useSelector((state: RootState) => state.user.user);
    return <div>
        <h1>Jury panel</h1>
        <div className="text-black">
            {user?.evaluates_in && user.evaluates_in.map((t: any) => <TournamentCard title={t.title} description={t.description} id={t.id}  />)}
        </div>
    </div>;
}

export default JuryPanel;