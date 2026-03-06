import { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";
import ReviewerApplicationForm from "@/components/ReviewerApplicationForm";
import Footer from "@/components/Footer";

import { editorialBoardMembers } from "@shared/editorial-board-data";

export default function EditorialBoard() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
              Editorial Board & Reviewers
            </h1>
            <p className="text-lg text-muted-foreground">
              Meet our distinguished editorial team and reviewers
            </p>
          </div>

          {!showForm ? (
            <div className="grid gap-8">
              {/* Editorial Board */}
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif flex items-center">
                    <Users className="h-6 w-6 mr-2" />
                    Editorial Board
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-6">
                    {editorialBoardMembers.map((member, index) => (
                      <div key={index} className="border-b border-border pb-6 last:border-b-0" data-testid={`editorial-member-${index}`}>
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <h3 className="text-xl font-semibold text-primary" data-testid={`text-member-name-${index}`}>{member.name}</h3>
                            <span className="text-lg font-medium text-muted-foreground" data-testid={`text-member-designation-${index}`}>{member.designation}</span>
                          </div>
                          
                          <div className="grid sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-foreground">Email: </span>
                              <a href={`mailto:${member.email}`} className="text-primary hover:underline" data-testid={`link-member-email-${index}`}>
                                {member.email}
                              </a>
                            </div>
                          </div>
                          
                          <div className="text-sm">
                            <span className="font-medium text-card-foreground">Address: </span>
                            <span className="text-slate-700" data-testid={`text-member-address-${index}`}>{member.address}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Journal Reviewers */}
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif">Journal Reviewers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg mb-4 font-semibold">Join Our Reviewer Panel</p>
                  <p className="text-muted-foreground mb-6">
                    Our distinguished panel of peer reviewers ensures the highest quality of published research through rigorous evaluation and constructive feedback. We are actively seeking qualified reviewers across all disciplines.
                  </p>
                  
                  <div className="bg-muted/30 p-6 rounded-md text-center">
                    <h3 className="text-xl font-semibold mb-3">Want to Join Our Team as a Reviewer?</h3>
                    <p className="text-muted-foreground mb-4">
                      Help shape the future of research. Click below to apply.
                    </p>
                    <Button 
                      size="lg" 
                      className="bg-primary text-primary-foreground"
                      onClick={() => setShowForm(true)}
                      data-testid="button-show-reviewer-form"
                    >
                      <UserPlus className="h-5 w-5 mr-2" />
                      Apply as Reviewer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  data-testid="button-back-to-editorial"
                >
                  ← Back to Editorial Board
                </Button>
              </div>
              <ReviewerApplicationForm />
            </div>
          )}
        </div>
      </section>
    <Footer />
    </div>
  );
}