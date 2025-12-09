// src/main/react/apps/app/landing/ica3LandingPage.tsx
// @ts-nocheck

import React, { useEffect, useState } from "react";
import "./ica3-landing.css";

type AuthMode = "signin" | "signup";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type QuestionType = "scale" | "multiple" | "yesno" | "text";

type Question =
  | {
      id: number;
      type: "scale";
      question: string;
      icon: JSX.Element;
      min: number;
      max: number;
      labels: [string, string];
    }
  | {
      id: number;
      type: "multiple";
      question: string;
      icon: JSX.Element;
      options: string[];
    }
  | {
      id: number;
      type: "yesno";
      question: string;
      icon: JSX.Element;
    }
  | {
      id: number;
      type: "text";
      question: string;
      icon: JSX.Element;
      placeholder: string;
    };

const questions: Question[] = [
  {
    id: 1,
    type: "scale",
    question: "How would you rate your organization's current digital infrastructure?",
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="#E3BB62">
        <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 10.93 5.16-1.191 9-5.38 9-10.93V7l-10-5z" />
      </svg>
    ),
    min: 1,
    max: 10,
    labels: ["Basic", "Enterprise-grade"],
  },
  {
    id: 2,
    type: "multiple",
    question: "What's your primary focus for digital transformation?",
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="#E3BB62">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    options: [
      "Security & Compliance",
      "Cloud Migration",
      "Data Analytics",
      "Process Automation",
    ],
  },
  {
    id: 3,
    type: "yesno",
    question: "Do you have a dedicated IT security team?",
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="#E3BB62">
        <rect x="3" y="11" width="18" height="10" rx="2" ry="2" opacity="0.3" />
        <circle
          cx="12"
          cy="7"
          r="4"
          fill="none"
          stroke="#E3BB62"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    id: 4,
    type: "text",
    question: "What's your biggest challenge in digital transformation?",
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="#E3BB62">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    placeholder: "Tell us about your main challenges...",
  },
  {
    id: 5,
    type: "multiple",
    question: "What's your organization's size?",
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="#E3BB62">
        <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.5 7h-5c-.83 0-1.5.67-1.5 1.5v9c0 .83.67 1.5 1.5 1.5H16v2h4z" />
        <circle cx="12" cy="4" r="2" />
        <circle cx="6" cy="4" r="2" />
      </svg>
    ),
    options: ["Small (1-50)", "Medium (51-200)", "Large (201-1000)", "Enterprise (1000+)"],
  },
  {
    id: 6,
    type: "scale",
    question: "How satisfied are you with your current data analytics capabilities?",
    icon: (
      <svg viewBox="0 0 24 24" width="32" height="32" fill="#E3BB62">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
      </svg>
    ),
    min: 1,
    max: 10,
    labels: ["Poor", "Excellent"],
  },
];

const Ica3LandingPage: React.FC = () => {
  // ---------- Modal & Auth ----------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // ---------- Assessment State ----------
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{ percent: number; label: string; color: string }>(
    {
      percent: 0,
      label: "Developing",
      color: "#EF4444",
    }
  );

  const currentQuestion = questions[currentStep];

  // ESC zum Schließen des Modals
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // ---------- Modal Handlers ----------
  const openAuthModal = () => setIsModalOpen(true);
  const closeAuthModal = () => setIsModalOpen(false);

  const handleAuthTab = (mode: AuthMode) => {
    setAuthMode(mode);
  };

  const handleFormChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAuthSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", { authMode, ...form });
    alert("Form submitted successfully! Check console for data.");
  };

  // ---------- Assessment Handlers ----------
  const handleScaleChange = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentStep]: value }));
  };

  const handleChoiceSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [currentStep]: option }));
  };

  const handleYesNoSelect = (value: "yes" | "no") => {
    setAnswers((prev) => ({ ...prev, [currentStep]: value }));
  };

  const handleTextChange = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentStep]: value }));
  };

  const goNext = () => {
    if (currentStep === questions.length - 1) {
      computeResults();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const computeResults = () => {
    let totalScore = 0;

    questions.forEach((q, index) => {
      const answer = answers[index];
      if (answer == null) return;

      if (q.type === "scale") {
        totalScore += answer * 10;
      } else if (q.type === "multiple") {
        totalScore += 75;
      } else if (q.type === "yesno") {
        totalScore += answer === "yes" ? 100 : 50;
      } else if (q.type === "text") {
        totalScore += (answer as string).length > 20 ? 90 : 60;
      }
    });

    const maxScore = questions.length * 100;
    const percent = Math.round((totalScore / maxScore) * 100);

    let label = "Developing";
    let color = "#EF4444";
    if (percent >= 75) {
      label = "Leading";
      color = "#22C55E";
    } else if (percent >= 50) {
      label = "Maturing";
      color = "#EAB308";
    }

    setResult({ percent, label, color });
    setShowResults(true);
  };

  const resetAssessment = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
    setResult({ percent: 0, label: "Developing", color: "#EF4444" });
  };

  // ---------- Render Helpers ----------
  const renderAnswerArea = () => {
    if (currentQuestion.type === "scale") {
      const value = answers[currentStep] ?? 5;
      const percent =
        ((value as number - currentQuestion.min) /
          (currentQuestion.max - currentQuestion.min)) *
        100;

      return (
        <div id="scale-question" className="question-type">
          <div style={{ padding: "0 16px" }}>
            <input
              type="range"
              min={currentQuestion.min}
              max={currentQuestion.max}
              value={value}
              onChange={(e) => handleScaleChange(Number(e.target.value))}
              style={{
                width: "100%",
                height: 8,
                background: `linear-gradient(to right,#E3BB62 ${percent}%,rgba(255,255,255,0.2) ${percent}%)`,
                borderRadius: 4,
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "rgba(255,255,255,0.6)",
                marginTop: 8,
              }}
            >
              <span>{currentQuestion.labels[0]}</span>
              <span style={{ color: "#E3BB62", fontWeight: 600 }}>{value}</span>
              <span>{currentQuestion.labels[1]}</span>
            </div>
          </div>
        </div>
      );
    }

    if (currentQuestion.type === "multiple") {
      const currentAnswer = answers[currentStep];

      return (
        <div id="multiple-question" className="question-type">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 16,
            }}
          >
            {currentQuestion.options.map((opt) => {
              const selected = opt === currentAnswer;
              return (
                <button
                  key={opt}
                  type="button"
                  className="choice-btn magnetic-button"
                  onClick={() => handleChoiceSelect(opt)}
                  style={{
                    padding: 24,
                    textAlign: "left",
                    background: selected
                      ? "rgba(227,187,98,0.2)"
                      : "rgba(255,255,255,0.1)",
                    border: selected
                      ? "1px solid rgba(227,187,98,0.5)"
                      : "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 16,
                    color: "white",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      className="choice-indicator"
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: "2px solid #E3BB62",
                        marginRight: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {selected && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#264555",
                          }}
                        />
                      )}
                    </div>
                    <span style={{ fontSize: "1.125rem" }}>{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (currentQuestion.type === "yesno") {
      const currentAnswer = answers[currentStep];

      return (
        <div id="yesno-question" className="question-type">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 24,
            }}
          >
            <button
              type="button"
              className="yesno-btn magnetic-button"
              onClick={() => handleYesNoSelect("yes")}
              style={{
                padding: 32,
                background:
                  currentAnswer === "yes"
                    ? "rgba(34,197,94,0.3)"
                    : "rgba(34,197,94,0.2)",
                border:
                  currentAnswer === "yes"
                    ? "1px solid rgba(34,197,94,0.5)"
                    : "1px solid rgba(34,197,94,0.3)",
                borderRadius: 16,
                color: "white",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>✓</div>
                <span style={{ fontSize: "1.25rem", fontWeight: 600 }}>Yes</span>
              </div>
            </button>

            <button
              type="button"
              className="yesno-btn magnetic-button"
              onClick={() => handleYesNoSelect("no")}
              style={{
                padding: 32,
                background:
                  currentAnswer === "no"
                    ? "rgba(239,68,68,0.3)"
                    : "rgba(239,68,68,0.2)",
                border:
                  currentAnswer === "no"
                    ? "1px solid rgba(239,68,68,0.5)"
                    : "1px solid rgba(239,68,68,0.3)",
                borderRadius: 16,
                color: "white",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>✗</div>
                <span style={{ fontSize: "1.25rem", fontWeight: 600 }}>No</span>
              </div>
            </button>
          </div>
        </div>
      );
    }

    // text
    const value = (answers[currentStep] as string) ?? "";
    return (
      <div id="text-question" className="question-type">
        <textarea
          value={value}
          placeholder={currentQuestion.placeholder}
          onChange={(e) => handleTextChange(e.target.value)}
          style={{
            width: "100%",
            minHeight: 120,
            padding: 16,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 16,
            color: "white",
            fontSize: "1rem",
            resize: "vertical",
          }}
        />
        <div
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "0.875rem",
            marginTop: 8,
          }}
        >
          {value.length} characters (minimum 10)
        </div>
      </div>
    );
  };

  const progress = (currentStep / questions.length) * 100;

  return (
    <div className="ica3-landing">
      {/* ========= HERO ========= */}
      <section className="hero-section bg-gradient-luxury">
        <div className="section-bg">
          {/* ein paar Deko-Elemente, wie im Original */}
          <div
            className="floating-particle animate-float"
            style={{ top: "25%", left: "15%" }}
          />
          <div
            className="floating-particle animate-float"
            style={{ top: "40%", left: "70%", animationDelay: "1s" }}
          />
          <div
            className="gradient-orb animate-pulse"
            style={{
              top: "50%",
              left: "16%",
              width: 256,
              height: 256,
              background: "rgba(227,187,98,0.1)",
            }}
          />
        </div>

        <div
          className="container text-center"
          style={{ position: "relative", zIndex: 10 }}
        >
          <div className="animate-fade-in-up">
            {/* Logo */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 32,
              }}
            >
              <div className="animated-logo">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#E3BB62"
                    strokeWidth="2"
                    opacity="0.3"
                    className="animate-rotate-slow"
                  />
                  <g className="animate-pulse">
                    <polygon
                      points="50,15 65,35 50,55 35,35"
                      fill="#E3BB62"
                    />
                    <polygon
                      points="50,45 65,65 50,85 35,65"
                      fill="#264555"
                    />
                  </g>
                  <circle
                    cx="50"
                    cy="50"
                    r="8"
                    fill="#E3BB62"
                    className="animate-pulse"
                  />
                </svg>
              </div>
            </div>

            <h1 className="font-outfit text-white">
              Know Your{" "}
              <span className="gradient-text animate-pulse">Maturity</span>.
              <br />
              Own Your{" "}
              <span
                className="gradient-text animate-pulse"
                style={{ animationDelay: "0.5s" }}
              >
                Future
              </span>
              .
            </h1>

            <p
              className="text-muted mb-8 max-w-3xl mx-auto"
              style={{ fontSize: "1.25rem", fontWeight: 300 }}
            >
              Digital confidence starts with knowing where you stand.
            </p>

            <p
              className="text-subtle mb-12 max-w-4xl mx-auto"
              style={{ fontSize: "1.125rem" }}
            >
              Transform your organization's IT maturity assessment with our
              intelligent, visual platform that turns complex evaluations into
              actionable insights.
            </p>

            <div className="flex flex-col sm-flex-row gap-6 justify-center items-center mb-16">
              <button
                type="button"
                className="btn btn-primary magnetic-button"
                onClick={openAuthModal}
              >
                Run My Free Assessment
              </button>
              <button
                type="button"
                className="btn btn-outline magnetic-button glass-effect"
              >
                Watch Interactive Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========= INTERACTIVE DEMO ========= */}
      <section
        id="interactive-demo"
        className="py-24 bg-gradient-luxury"
        style={{
          background:
            "linear-gradient(135deg,#1C1C1E 0%,#264555 50%,#1C1C1E 100%)",
        }}
      >
        <div
          className="container"
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1200,
          }}
        >
          <div className="text-center mb-16 animate-fade-in-up">
            <h2
              className="font-outfit text-white"
              style={{ fontSize: "clamp(2.5rem,5vw,3.5rem)" }}
            >
              Try the <span className="gradient-text">ICA³ Experience</span>
            </h2>
            <p
              className="text-muted"
              style={{
                fontSize: "1.25rem",
                maxWidth: 768,
                margin: "0 auto",
              }}
            >
              Experience our adaptive assessment with different question types
              and smart logic
            </p>
          </div>

          {/* Assessment / Results */}
          {!showResults ? (
            <div
              id="assessment-container"
              style={{ maxWidth: 896, margin: "0 auto" }}
            >
              <div
                className="glass-effect animate-scale-in"
                style={{
                  borderRadius: 24,
                  padding: 48,
                  border: "1px solid rgba(227,187,98,0.2)",
                }}
              >
                {/* Progress */}
                <div style={{ marginBottom: 32 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "0.875rem",
                      marginBottom: 8,
                    }}
                  >
                    <span>
                      Question {currentStep + 1} of {questions.length}
                    </span>
                    <span>{Math.round(progress)}% Complete</span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: 9999,
                      height: 12,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${progress}%`,
                        height: "100%",
                        background:
                          "linear-gradient(135deg,#E3BB62 0%,#D2C9B9 100%)",
                        borderRadius: 9999,
                        transition: "width 0.5s ease",
                        position: "relative",
                      }}
                    >
                      <div
                        className="animate-pulse"
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Question */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 32,
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      background: "rgba(227,187,98,0.2)",
                      borderRadius: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 24,
                    }}
                    className="animate-float"
                  >
                    {currentQuestion.icon}
                  </div>
                  <h3
                    className="font-outfit text-white"
                    style={{
                      fontSize: "clamp(1.25rem,3vw,1.75rem)",
                      flex: 1,
                      textAlign: "center",
                    }}
                  >
                    {currentQuestion.question}
                  </h3>
                </div>

                {/* Answer area */}
                <div style={{ marginBottom: 32 }}>{renderAnswerArea()}</div>

                {/* Navigation */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <button
                    type="button"
                    onClick={goPrev}
                    className="magnetic-button"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "white",
                      padding: "12px 24px",
                      borderRadius: 12,
                      cursor: currentStep === 0 ? "default" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      opacity: currentStep === 0 ? 0.5 : 1,
                      pointerEvents: currentStep === 0 ? "none" : "auto",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ marginRight: 8 }}
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Previous
                  </button>

                  <div style={{ display: "flex", gap: 8 }}>
                    {questions.map((_, idx) => (
                      <div
                        key={idx}
                        className="step-dot"
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background:
                            idx === currentStep
                              ? "#E3BB62"
                              : idx < currentStep
                              ? "rgba(227,187,98,0.6)"
                              : "rgba(255,255,255,0.2)",
                          transform:
                            idx === currentStep ? "scale(1.25)" : "scale(1)",
                          transition: "all 0.3s",
                        }}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={goNext}
                    className="magnetic-button"
                    style={{
                      background: "#E3BB62",
                      border: "none",
                      color: "#1C1C1E",
                      padding: "12px 24px",
                      borderRadius: 12,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 600,
                    }}
                  >
                    {currentStep === questions.length - 1 ? (
                      <>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{ marginRight: 8 }}
                        >
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                        Submit
                      </>
                    ) : (
                      <>
                        Next
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{ marginLeft: 8 }}
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              id="results-container"
              style={{ maxWidth: 896, margin: "0 auto" }}
            >
              <div
                className="glass-effect animate-scale-in"
                style={{
                  borderRadius: 24,
                  padding: 48,
                  border: "1px solid rgba(227,187,98,0.2)",
                  textAlign: "center",
                }}
              >
                <div style={{ marginBottom: 32 }}>
                  <div
                    id="score-circle"
                    style={{
                      width: 160,
                      height: 160,
                      margin: "0 auto 24px",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        border: "8px solid rgba(255,255,255,0.2)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        id="score-fill"
                        className="animate-pulse"
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: "50%",
                          border: "8px solid #E3BB62",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 8,
                          background: "rgba(28,28,30,0.8)",
                          borderRadius: "50%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          id="score-value"
                          style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: result.color,
                          }}
                        >
                          {result.percent}%
                        </div>
                        <div
                          style={{
                            color: "rgba(255,255,255,0.6)",
                            fontSize: "0.875rem",
                          }}
                        >
                          Maturity
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3
                    className="font-outfit text-white"
                    style={{ fontSize: "2rem", marginBottom: 16 }}
                  >
                    Your Digital Maturity:{" "}
                    <span className="gradient-text">{result.label}</span>
                  </h3>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <button className="btn btn-primary magnetic-button">
                    Get Full Assessment Report
                  </button>
                  <button
                    type="button"
                    onClick={resetAssessment}
                    className="btn btn-outline magnetic-button glass-effect"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ marginRight: 8 }}
                    >
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                    Start New Assessment
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========= FOOTER (leicht gekürzt) ========= */}
      <footer className="py-24">
        <div className="container" style={{ position: "relative", zIndex: 10 }}>
          <div className="grid grid-cols-1 md-grid-cols-4 gap-8">
            <div style={{ gridColumn: "span 2" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                <div className="animated-logo" style={{ width: 48, height: 48 }}>
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#E3BB62"
                      strokeWidth="2"
                      opacity="0.3"
                      className="animate-rotate-slow"
                    />
                    <polygon
                      points="50,15 65,35 50,55 35,35"
                      fill="#E3BB62"
                    />
                    <polygon
                      points="50,45 65,65 50,85 35,65"
                      fill="#264555"
                    />
                    <circle cx="50" cy="50" r="8" fill="#E3BB62" />
                  </svg>
                </div>
                <h3
                  className="gradient-text font-outfit"
                  style={{ fontSize: "1.875rem", fontWeight: 700 }}
                >
                  ICA³
                </h3>
              </div>
              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  maxWidth: 400,
                  marginBottom: 24,
                }}
              >
                Elevating digital maturity assessments through intelligent,
                visual platforms that transform complexity into actionable
                insights.
              </p>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              marginTop: 48,
              paddingTop: 32,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.875rem",
              }}
            >
              © 2024 CAP Consulting. All rights reserved.
              <span
                className="animate-pulse"
                style={{
                  display: "inline-block",
                  width: 4,
                  height: 4,
                  background: "#E3BB62",
                  borderRadius: "50%",
                  marginLeft: 8,
                }}
              />
            </p>
          </div>
        </div>
      </footer>

      {/* ========= AUTH MODAL ========= */}
      <div
        className={`modal-overlay ${isModalOpen ? "active" : ""}`}
        id="authModal"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeAuthModal();
        }}
      >
        <div className="auth-modal">
          <button className="modal-close" onClick={closeAuthModal}>
            ×
          </button>

          <div
            style={{
              textAlign: "center",
              marginBottom: 24,
              position: "relative",
              zIndex: 10,
            }}
          >
            <h2
              className="gradient-text font-outfit"
              style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}
            >
              {authMode === "signin" ? "Welcome Back" : "Join ICA³"}
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.875rem",
              }}
            >
              {authMode === "signin"
                ? "Sign in to continue your assessment journey"
                : "Start your digital maturity assessment today"}
            </p>
          </div>

          <div className="tab-toggle" style={{ position: "relative", zIndex: 10 }}>
            <button
              className={`tab-btn ${authMode === "signin" ? "active" : ""}`}
              onClick={() => handleAuthTab("signin")}
            >
              Sign In
            </button>
            <button
              className={`tab-btn ${authMode === "signup" ? "active" : ""}`}
              onClick={() => handleAuthTab("signup")}
            >
              Sign Up
            </button>
          </div>

          <form
            onSubmit={handleAuthSubmit}
            style={{ position: "relative", zIndex: 10 }}
          >
            {authMode === "signup" && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className="form-input"
                    placeholder="John"
                    value={form.firstName}
                    onChange={(e) =>
                      handleFormChange("firstName", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className="form-input"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={(e) =>
                      handleFormChange("lastName", e.target.value)
                    }
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => handleFormChange("password", e.target.value)}
              />
            </div>

            {authMode === "signup" && (
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    handleFormChange("confirmPassword", e.target.value)
                  }
                />
              </div>
            )}

            <button type="submit" className="btn-submit">
              {authMode === "signin"
                ? "Sign In & Start Assessment"
                : "Create Account & Begin"}
            </button>
          </form>

          {authMode === "signin" && (
            <div
              className="forgot-password"
              style={{ position: "relative", zIndex: 10 }}
            >
              <a href="#">Forgot your password?</a>
            </div>
          )}

          <div
            className="modal-divider"
            style={{ position: "relative", zIndex: 10 }}
          >
            <span>SECURE & ENCRYPTED</span>
          </div>
        </div>
      </div>
      </div>
  );
};

export default Ica3LandingPage;
