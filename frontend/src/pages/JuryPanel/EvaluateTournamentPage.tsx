import { getSubmissions } from "@/api/requests";
import { auth } from "@/firebase";
import type { RootState } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import SubmissionCard from "./components/SubmissionCard";

const EvaluateTournamentPage = () => {
  const {id} = useParams();
  const user = auth.currentUser;
  const {
    data: submissions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tournament", id],
    queryFn: async () => {
      if (!id) return;
      if (!user) return;
      return await getSubmissions(id, user);
    },
    enabled: !!id,
    retry: 1,
  });

  if (isLoading || !submissions) return <>Loading...</>

  return <div className="text-black">{submissions.map((s) => <SubmissionCard team={s.team} />)}</div>;
}
 
export default EvaluateTournamentPage;