import { Link } from "react-router-dom";

interface TournamentCardProps {
    title: string;
    description: string;
    id: number;
}

const TournamentCard = ({title, description, id}: TournamentCardProps) => {
    return <div>
        <h2>{title}</h2>
        <p>{description.substring(0, description.length < 120 ? description.length : 120)}</p>
        <Link to={'/jury-panel/evaluate/' + id}>Оцінити</Link>
    </div>;
}
 
export default TournamentCard;