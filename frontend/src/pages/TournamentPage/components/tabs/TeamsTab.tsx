import { UserIcon, MailIcon } from "../../icons";
import type { Team } from "../../types";

interface TeamsTabProps {
  teams: Team[];
}

export const TeamsTab = ({ teams }: TeamsTabProps) => {
  if (!teams || teams.length === 0) {
    return (
      <div className="animate-[fadeIn_0.4s_ease_forwards] flex flex-col items-center justify-center text-center py-16">
        <div className="w-[100px] h-[100px] bg-slate-50/80 rounded-full flex justify-center items-center text-slate-300 mb-8 shadow-inner">
          <UserIcon />
        </div>
        <h2 className="text-[28px] md:text-[32px] mb-4 text-dark-theme font-quicksand font-bold">
          Команд ще немає
        </h2>
        <p className="max-w-[420px] text-slate-500 text-[17px] leading-relaxed">
          Команди початимуть приєднуватися по мірі входження вас у турнір
        </p>
      </div>
    );
  }

  return (
    <div className="animate-[fadeIn_0.5s_ease_forwards] flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div
            key={team.name}
            className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-6 border border-slate-200 hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <div className="mb-4">
              <h3 className="text-[20px] font-bold text-dark-theme font-quicksand mb-2 line-clamp-2">
                {team.name}
              </h3>
              <p className="text-[14px] text-slate-500 mb-3 flex items-center gap-2">
                <MailIcon />
                <a
                  href={`mailto:${team.team_email}`}
                  className="hover:text-primary transition-colors break-all"
                >
                  {team.team_email}
                </a>
              </p>
            </div>

            <div className="mb-4">
              <p className="text-[13px] text-slate-600 mb-2 font-semibold">
                Контакт: {team.contact_info}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-[13px] font-semibold text-slate-600 mb-3">
                Учасники ({team.members.length}):
              </p>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {team.members.map((member) => (
                  <div
                    key={member.email}
                    className="bg-white rounded-lg p-3 text-[13px]"
                  >
                    <p className="font-medium text-dark-theme line-clamp-1">
                      {member.full_name}
                    </p>
                    <p className="text-slate-500 line-clamp-1">
                      {member.email}
                    </p>
                    {member.educational_institution && (
                      <p className="text-slate-400 text-[12px] line-clamp-1">
                        {member.educational_institution}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
