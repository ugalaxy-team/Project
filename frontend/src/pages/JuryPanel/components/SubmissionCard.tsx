import type { Team } from "@/api/requests";
import { Link } from "react-router-dom";

interface SubmissionCardProps {
    team: Team;
}

const SubmissionCard = ({team}: SubmissionCardProps) => {
    return <div>
        <h2>Submission from {team.name}</h2>
        <Link to={'#'}>Оглянути</Link>
    </div>;
}
 
export default SubmissionCard;