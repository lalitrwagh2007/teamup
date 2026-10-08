"use client";

import { useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { addUserSkill, removeUserSkill, updateSkillProficiency, getAllSkills, getUserSkills } from "@/app/actions/skills";
import type { ProficiencyLevel, Skill, UserSkillItem } from "@/types/user";
import SkillTags from "./SkillTags";

const PROFICIENCY_OPTIONS: ProficiencyLevel[] = ["Beginner", "Intermediate", "Advanced", "Expert"];

interface UserSkillsManagerProps {
  initialUserSkills?: UserSkillItem[];
}

export default function UserSkillsManager({ initialUserSkills = [] }: UserSkillsManagerProps) {
  const [userSkills, setUserSkills] = useState<UserSkillItem[]>(initialUserSkills);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkillName, setSelectedSkillName] = useState("");
  const [selectedProficiency, setSelectedProficiency] = useState<ProficiencyLevel>("Intermediate");
  
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    // Fetch pre-seeded available skills for suggestions
    async function loadSkills() {
      const res = await getAllSkills();
      if (res.success && res.data) {
        setAvailableSkills(res.data);
      }
      
      // If initialUserSkills is empty, load user's real skills from database
      if (initialUserSkills.length === 0) {
        const userRes = await getUserSkills();
        if (userRes.success && userRes.data) {
          setUserSkills(userRes.data);
        }
      }
    }
    loadSkills();
  }, [initialUserSkills]);

  // Handle Adding a Skill
  const handleAddSkill = () => {
    if (!selectedSkillName.trim()) {
      setFeedback({ type: "error", message: "Please enter or select a skill name." });
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const res = await addUserSkill(selectedSkillName.trim(), selectedProficiency);
      if (res.success && res.data) {
        setUserSkills(res.data);
        setSelectedSkillName("");
        setFeedback({ type: "success", message: res.message || "Skill added successfully!" });
      } else {
        setFeedback({ type: "error", message: res.message || "Failed to add skill." });
      }
    });
  };

  // Handle Removing a Skill
  const handleRemoveSkill = (skillId: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await removeUserSkill(skillId);
      if (res.success && res.data) {
        setUserSkills(res.data);
        setFeedback({ type: "success", message: res.message || "Skill removed successfully." });
      } else {
        setFeedback({ type: "error", message: res.message || "Failed to remove skill." });
      }
    });
  };

  // Handle Updating Proficiency Level
  const handleProficiencyChange = (skillId: string, newProficiency: ProficiencyLevel) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateSkillProficiency(skillId, newProficiency);
      if (res.success && res.data) {
        setUserSkills(res.data);
        setFeedback({ type: "success", message: res.message || "Proficiency updated." });
      } else {
        setFeedback({ type: "error", message: res.message || "Failed to update proficiency." });
      }
    });
  };

  return (
    <Card className="border-2 border-zinc-900 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center justify-between">
          <span>Manage Skills & Proficiency</span>
          <Badge variant="outline" className="text-xs font-semibold">
            {userSkills.length} {userSkills.length === 1 ? "Skill" : "Skills"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Add skills to your profile and select your proficiency level (Beginner, Intermediate, Advanced, Expert).
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-6">
        {/* Feedback Message */}
        {feedback && (
          <div
            className={`p-3 rounded-lg text-sm flex items-center gap-2 border ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Add Skill Form */}
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-muted/40 border border-border">
          <label className="text-sm font-semibold text-foreground">Add New Skill</label>
          <div className="grid gap-3 sm:grid-cols-12 items-center">
            {/* Skill Name Input / Select */}
            <div className="sm:col-span-6">
              <Input
                placeholder="e.g. React, Python, Figma"
                value={selectedSkillName}
                onChange={(e) => setSelectedSkillName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                disabled={isPending}
                className="bg-background"
                list="preseeded-skills-list"
              />
              <datalist id="preseeded-skills-list">
                {availableSkills.map((s) => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            </div>

            {/* Proficiency Dropdown */}
            <div className="sm:col-span-4">
              <Select
                value={selectedProficiency}
                onValueChange={(val) => setSelectedProficiency(val as ProficiencyLevel)}
                disabled={isPending}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Proficiency" />
                </SelectTrigger>
                <SelectContent>
                  {PROFICIENCY_OPTIONS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2">
              <Button
                type="button"
                onClick={handleAddSkill}
                disabled={isPending || !selectedSkillName.trim()}
                className="w-full gap-1 bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="size-4" />
                    <span>Add</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* User Skills Preview */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Current Skill Tags</h4>
          {userSkills.length > 0 ? (
            <SkillTags
              skills={userSkills}
              showProficiency={true}
              onRemoveSkill={(item) => {
                const sId = typeof item === "object" && item !== null
                  ? ("skillId" in item && typeof item.skillId === "string" ? item.skillId : ("id" in item && typeof item.id === "string" ? item.id : undefined))
                  : undefined;
                if (sId) handleRemoveSkill(sId);
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground italic">No skills added yet. Add your first skill above!</p>
          )}
        </div>

        {/* Detailed User Skills List with Proficiency Editor */}
        {userSkills.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground">Edit Skills & Proficiency Levels</h4>
            <div className="divide-y divide-border rounded-lg border border-border bg-card">
              {userSkills.map((skill) => (
                <div key={skill.skillId} className="flex items-center justify-between p-3 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-sm text-foreground truncate">{skill.name}</span>
                    {skill.category && (
                      <span className="text-xs text-muted-foreground hidden sm:inline">({skill.category})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Select
                      value={skill.proficiency}
                      onValueChange={(val) => handleProficiencyChange(skill.skillId, val as ProficiencyLevel)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROFICIENCY_OPTIONS.map((level) => (
                          <SelectItem key={level} value={level} className="text-xs">
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSkill(skill.skillId)}
                      disabled={isPending}
                      className="size-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      aria-label={`Delete ${skill.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

