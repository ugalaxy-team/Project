import { useTranslation } from "react-i18next";
import { UserIcon, MailIcon } from "../../icons";
import type { Team } from "../../types";

interface TeamsTabProps {
  teams: Team[];
}

export const TeamsTab = ({ teams }: TeamsTabProps) => {
  const { t } = useTranslation("tournament");

  if (!teams || teams.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center animate-[fadeIn_0.5s_ease_forwards]">
        <div className="w-16 h-16 bg-bg-card rounded-2xl flex items-center justify-center border border-border mb-6 shadow-sm transition-colors duration-300 [&>svg]:w-10 [&>svg]:h-10">
          <UserIcon className="text-text-muted/60" />
        </div>
        <h3 className="text-[22px] md:text-[26px] font-bold text-text-main mb-2 transition-colors duration-300">
          {t("teams.empty.title")}
        </h3>
        <p className="text-text-muted text-[15px] md:text-[17px] max-w-[420px] transition-colors duration-300">
          {t("teams.empty.description")}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-[fadeIn_0.5s_ease_forwards] flex flex-col gap-6 md:gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {teams.map((team) => (
          <div
            key={team.name}
            className="bg-bg-body rounded-2xl p-5 md:p-6 border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="mb-4">
              <h3 className="text-[18px] md:text-[20px] font-bold text-text-main font-quicksand mb-2 line-clamp-2 transition-colors duration-300">
                {team.name}
              </h3>
              <p className="text-[13px] md:text-[14px] text-text-muted mb-3 flex items-center gap-2 transition-colors duration-300">
                <MailIcon className="w-4 h-4 shrink-0" />
                <a
                  href={`mailto:${team.team_email}`}
                  className="hover:text-primary transition-colors break-all"
                >
                  {team.team_email}
                </a>
              </p>
            </div>

            <div className="mb-4">
              <p className="text-[13px] text-text-muted mb-2 font-semibold transition-colors duration-300">
                {t("teams.contact")}:{" "}
                <span className="text-text-main font-normal">
                  {team.contact_info}
                </span>
              </p>
            </div>

            <div className="pt-4 border-t border-border transition-colors duration-300">
              <p className="text-[13px] font-semibold text-text-muted mb-3 transition-colors duration-300">
                {t("teams.members")} ({team.members.length}):
              </p>
              <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar pr-2">
                {team.members.map((member) => (
                  <div
                    key={member.email}
                    className="bg-bg-card border border-border rounded-lg p-3 text-[13px] transition-colors duration-300"
                  >
                    <p className="font-medium text-text-main line-clamp-1 transition-colors duration-300">
                      {member.full_name}
                    </p>
                    <p className="text-text-muted line-clamp-1 transition-colors duration-300">
                      {member.email}
                    </p>
                    {member.educational_institution && (
                      <p className="text-text-muted/70 text-[12px] line-clamp-1 mt-1 transition-colors duration-300">
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
