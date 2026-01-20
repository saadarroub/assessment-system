// @ts-nocheck
import React, { useEffect, useMemo } from "react";
import AppHeader from "@/apps/app/AppHeader";
import patternUrl from "@/assets/footer-pattern.svg";

export default function LandingPage() {
  const html = useMemo(() => `
<!-- ========== HERO SECTION ========== -->
<section class="hero-section bg-gradient-luxury relative">
    <!-- Floating 3D Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <!-- Floating geometric shapes -->
        <div class="absolute opacity-20" style="top: 25%; left: 25%; width: 128px; height: 128px;">
            <div class="animate-float" style="animation-duration: 8s; width: 100%; height: 100%; position: relative;">
                <div class="absolute inset-0 rounded-lg rotate-45 animate-rotate-slow" style="background: linear-gradient(135deg, rgba(227, 187, 98, 0.3), rgba(38, 69, 85, 0.3));"></div>
                <div class="absolute rounded-lg -rotate-45" style="inset: 16px; background: linear-gradient(225deg, rgba(227, 187, 98, 0.2), rgba(38, 69, 85, 0.2));"></div>
            </div>
        </div>
        
        <div class="absolute opacity-15" style="top: 33%; right: 25%; width: 96px; height: 96px;">
            <div class="animate-float" style="animation-delay: 2s; animation-duration: 6s; width: 100%; height: 100%;">
                <div class="w-full h-full rounded-full animate-pulse" style="background: linear-gradient(135deg, rgba(210, 201, 185, 0.4), rgba(227, 187, 98, 0.4));"></div>
                <div class="absolute rounded-full" style="inset: 8px; background: linear-gradient(225deg, rgba(38, 69, 85, 0.3), rgba(28, 28, 30, 0.3));"></div>
            </div>
        </div>
        
        <div class="absolute opacity-25" style="bottom: 25%; left: 33%; width: 80px; height: 80px;">
            <div class="animate-float" style="animation-delay: 4s; animation-duration: 10s; width: 100%; height: 100%;">
                <div class="w-full h-full rounded-lg rotate-12 animate-rotate-slow" style="background: linear-gradient(135deg, rgba(38, 69, 85, 0.4), rgba(227, 187, 98, 0.4));"></div>
            </div>
        </div>
        
        <!-- Floating particles -->
        <div class="floating-particle animate-float" style="top: 25%; left: 15%; animation-delay: 0s;"></div>
        <div class="floating-particle animate-float" style="top: 40%; left: 75%; animation-delay: 1s;"></div>
        <div class="floating-particle animate-float" style="top: 60%; left: 25%; animation-delay: 2s;"></div>
        <div class="floating-particle animate-float" style="top: 35%; left: 60%; animation-delay: 1.5s;"></div>
        <div class="floating-particle animate-float" style="top: 70%; left: 80%; animation-delay: 0.5s;"></div>
        <div class="floating-particle animate-float" style="top: 20%; left: 45%; animation-delay: 2.5s;"></div>
        <div class="floating-particle animate-float" style="top: 55%; left: 35%; animation-delay: 3s;"></div>
        <div class="floating-particle animate-float" style="top: 45%; left: 85%; animation-delay: 1.2s;"></div>
        <div class="floating-particle animate-float" style="top: 75%; left: 50%; animation-delay: 0.8s;"></div>
        <div class="floating-particle animate-float" style="top: 30%; left: 90%; animation-delay: 2.2s;"></div>
        <div class="floating-particle animate-float" style="top: 65%; left: 10%; animation-delay: 1.8s;"></div>
        <div class="floating-particle animate-float" style="top: 80%; left: 70%; animation-delay: 3.5s;"></div>
        
        <!-- Gradient orbs -->
        <div class="gradient-orb animate-pulse" style="top: 50%; left: 16.66%; width: 256px; height: 256px; background: radial-gradient(circle, rgba(227, 187, 98, 0.1), transparent); animation-duration: 4s;"></div>
        <div class="gradient-orb animate-pulse" style="bottom: 33%; right: 16.66%; width: 192px; height: 192px; background: radial-gradient(circle, rgba(38, 69, 85, 0.1), transparent); animation-delay: 2s; animation-duration: 6s;"></div>
    </div>

    <!-- Enhanced Background Geometric Animation -->
    <div class="absolute inset-0 opacity-30">
        <div class="absolute rotate-45 animate-rotate-slow" style="top: 25%; left: 25%; width: 128px; height: 128px; border: 2px solid rgba(227, 187, 98, 0.4);">
            <div class="w-full h-full rotate-45 animate-rotate-slow" style="border: 1px solid rgba(227, 187, 98, 0.2); animation-direction: reverse;"></div>
        </div>
        <div class="absolute rounded-full animate-float" style="top: 33%; right: 25%; width: 96px; height: 96px; border: 2px solid rgba(227, 187, 98, 0.5);">
            <div class="w-full h-full rounded-full animate-pulse" style="border: 1px solid rgba(227, 187, 98, 0.3);"></div>
        </div>
        <div class="absolute rotate-12 animate-float" style="bottom: 25%; left: 33%; width: 80px; height: 80px; border: 2px solid rgba(227, 187, 98, 0.3); animation-delay: 2s;">
            <div class="w-full h-full rounded-lg animate-pulse" style="background: linear-gradient(135deg, rgba(227, 187, 98, 0.2), rgba(38, 69, 85, 0.2));"></div>
        </div>
        
        <!-- Animated connecting lines -->
        <svg class="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#E3BB62" stop-opacity="0.6"/>
                    <stop offset="100%" stop-color="#264555" stop-opacity="0.2"/>
                </linearGradient>
            </defs>
            <path d="M 25% 25% Q 50% 10% 75% 25% T 75% 75% Q 50% 90% 25% 75% T 25% 25%"
                  stroke="url(#lineGradient)" stroke-width="2" fill="none" class="animate-pulse"/>
        </svg>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-6 text-center relative z-10">
        <div class="animate-fade-in-up">
            <!-- Animated Logo -->
            <div class="flex justify-center mb-8">
                <div class="animated-logo relative">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <!-- Outer rotating ring -->
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#E3BB62" stroke-width="2" opacity="0.3" class="animate-rotate-slow"/>
                        
                        <!-- Inner geometric pattern -->
                        <g class="animate-pulse">
                            <polygon points="50,15 65,35 50,55 35,35" fill="#E3BB62"/>
                            <polygon points="50,45 65,65 50,85 35,65" fill="#264555"/>
                        </g>
                        
                        <!-- Central core -->
                        <circle cx="50" cy="50" r="8" fill="#E3BB62" class="animate-pulse"/>
                        
                        <!-- Floating particles -->
                        <circle cx="25" cy="25" r="2" fill="#E3BB62" opacity="0.6" class="animate-float"/>
                        <circle cx="75" cy="25" r="2" fill="#264555" opacity="0.6" class="animate-float" style="animation-delay: 1s;"/>
                        <circle cx="25" cy="75" r="2" fill="#264555" opacity="0.6" class="animate-float" style="animation-delay: 2s;"/>
                        <circle cx="75" cy="75" r="2" fill="#E3BB62" opacity="0.6" class="animate-float" style="animation-delay: 1.5s;"/>
                    </svg>
                    <!-- Glowing effect on hover -->
                    <div class="absolute inset-0 rounded-full blur-lg opacity-0" style="background: linear-gradient(135deg, rgba(227, 187, 98, 0.2), rgba(38, 69, 85, 0.2)); z-index: -1;"></div>
                </div>
            </div>
            
            <h1 class="font-outfit font-bold text-white mb-6 leading-tight" style="font-size: clamp(2.5rem, 5vw, 4.5rem);">
                Know Your <span class="gradient-text animate-pulse">Maturity</span>.<br>
                Own Your <span class="gradient-text animate-pulse" style="animation-delay: 0.5s;">Future</span>.
            </h1>
            
            <p class="text-xl text-muted mb-8 max-w-3xl mx-auto font-light animate-fade-in-up" style="animation-delay: 0.3s; color: rgba(255,255,255,0.8);">
                Digital confidence starts with knowing where you stand.
            </p>
            
            <p class="text-lg mb-12 max-w-2xl mx-auto animate-fade-in-up" style="animation-delay: 0.6s; color: rgba(255,255,255,0.6);">
                Transform your organization's IT maturity assessment with our intelligent, 
                visual platform that turns complex evaluations into actionable insights.
            </p>

            <div class="flex flex-col gap-6 justify-center items-center mb-16 animate-fade-in-up" style="animation-delay: 0.9s;">
                <div class="flex flex-wrap gap-6 justify-center">
                    <button onclick="openAuthModal()" class="btn btn-primary btn-lg magnetic-button font-semibold relative overflow-hidden">
                        <span class="relative z-10">Run My Free Assessment</span>
                    </button>
                    
                    <button class="btn btn-outline btn-lg magnetic-button glass-effect relative overflow-hidden">
                        <span class="relative z-10">Watch Interactive Demo</span>
                    </button>
                </div>
            </div>

            <!-- Key Feature Cards -->
            <div class="grid grid-cols-1 gap-8 max-w-5xl mx-auto mb-16 animate-fade-in-up md-grid-cols-3" style="animation-delay: 1.2s;">
                <div class="feature-card glass-effect">
                    <div class="feature-icon animate-pulse">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2a9 9 0 0 1 9 9c0 3.87-2.13 7.25-5.28 9.03a1 1 0 0 1-1.14-.1L12 18l-2.58 1.93a1 1 0 0 1-1.14.1C5.13 18.25 3 14.87 3 11a9 9 0 0 1 9-9Z"/>
                            <path d="M12 8v4"/>
                            <path d="M12 16h.01"/>
                        </svg>
                    </div>
                    <h4 class="text-xl font-outfit font-bold text-white mb-3">Smart Questions</h4>
                    <p style="color: rgba(255,255,255,0.7);">Adaptive logic that learns as you answer</p>
                </div>
                
                <div class="feature-card glass-effect">
                    <div class="feature-icon animate-pulse">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10"/>
                            <line x1="12" y1="20" x2="12" y2="4"/>
                            <line x1="6" y1="20" x2="6" y2="14"/>
                        </svg>
                    </div>
                    <h4 class="text-xl font-outfit font-bold text-white mb-3">Visual Insights</h4>
                    <p style="color: rgba(255,255,255,0.7);">Beautiful dashboards that tell your story</p>
                </div>
                
                <div class="feature-card glass-effect">
                    <div class="feature-icon animate-pulse">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <circle cx="12" cy="12" r="6"/>
                            <circle cx="12" cy="12" r="2"/>
                        </svg>
                    </div>
                    <h4 class="text-xl font-outfit font-bold text-white mb-3">Actionable Plans</h4>
                    <p style="color: rgba(255,255,255,0.7);">Tailored roadmaps for your next steps</p>
                </div>
            </div>
        </div>

        <!-- Enhanced Scroll Indicator -->
        <div class="scroll-indicator text-subtle animate-bounce cursor-pointer">
            <div class="scroll-mouse" style="border-color: rgba(255,255,255,0.3);">
                <div class="scroll-dot animate-pulse"></div>
            </div>
        </div>
    </div>
</section>


<!-- ========== SERVICES SECTION ========== -->
<section class="py-24 bg-bone relative overflow-hidden">
    <!-- 3D Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute opacity-10" style="top: 25%; left: 16.66%; width: 128px; height: 128px;">
            <div class="w-full h-full rounded-full animate-float blur-xl" style="background: linear-gradient(135deg, rgba(227, 187, 98, 0.3), rgba(38, 69, 85, 0.3));"></div>
        </div>
        <div class="absolute opacity-5" style="bottom: 25%; right: 16.66%; width: 192px; height: 192px;">
            <div class="w-full h-full rounded-lg rotate-45 animate-rotate-slow blur-2xl" style="background: linear-gradient(225deg, rgba(210, 201, 185, 0.4), rgba(227, 187, 98, 0.4));"></div>
        </div>
    </div>

    <div class="container mx-auto px-6 relative z-10">
        <div class="text-center mb-16 animate-fade-in-up">
            <h2 class="font-outfit font-bold text-graphite mb-6" style="font-size: clamp(2rem, 4vw, 3rem);">
                A New Dimension of 
                <span class="gradient-text"> Digital Self-Knowledge</span>
            </h2>
            <p class="text-xl max-w-3xl mx-auto" style="color: rgba(28, 28, 30, 0.7);">
                Transform complexity into clarity with our suite of intelligent assessment tools
            </p>
        </div>

        <div class="grid grid-cols-1 gap-8 md-grid-cols-2 lg-grid-cols-4">
            <!-- Service Card 1 -->
            <div class="service-card glass-effect-light animate-fade-in-up" style="animation-delay: 0s;">
                <div class="service-icon">
                    <svg viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#E3BB62"/>
                                <stop offset="100%" stop-color="#264555"/>
                            </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="35" fill="url(#brainGradient)" opacity="0.2" class="animate-pulse"/>
                        <path d="M30 40 Q50 20 70 40 Q60 60 50 50 Q40 60 30 40" fill="#E3BB62" class="animate-float"/>
                        <circle cx="40" cy="45" r="3" fill="#264555" class="animate-ping" style="animation-delay: 0s;"/>
                        <circle cx="60" cy="45" r="3" fill="#264555" class="animate-ping" style="animation-delay: 1s;"/>
                        <circle cx="50" cy="55" r="2" fill="#E3BB62" class="animate-ping" style="animation-delay: 2s;"/>
                    </svg>
                </div>
                <h3 class="text-xl font-outfit font-semibold text-graphite mb-4">Self-Assessment Engine</h3>
                <p class="mb-6 leading-relaxed" style="color: rgba(28, 28, 30, 0.7);">A smart, dynamic way to evaluate digital maturity in seconds.</p>
                <div class="space-y-2">
                    <div class="service-feature"><div class="service-feature-dot animate-pulse"></div>Adaptive questions</div>
                    <div class="service-feature"><div class="service-feature-dot animate-pulse"></div>Conditional logic</div>
                    <div class="service-feature"><div class="service-feature-dot animate-pulse"></div>Instant scoring</div>
                </div>
                <div class="service-bar"></div>
            </div>

            <!-- Service Card 2 -->
            <div class="service-card glass-effect-light animate-fade-in-up" style="animation-delay: 0.2s;">
                <div class="service-icon">
                    <svg viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#D2C9B9"/>
                                <stop offset="100%" stop-color="#E3BB62"/>
                            </linearGradient>
                        </defs>
                        <rect x="20" y="60" width="8" height="25" fill="url(#chartGradient)" class="animate-pulse" style="animation-delay: 0s;"/>
                        <rect x="35" y="45" width="8" height="40" fill="url(#chartGradient)" class="animate-pulse" style="animation-delay: 0.5s;"/>
                        <rect x="50" y="30" width="8" height="55" fill="url(#chartGradient)" class="animate-pulse" style="animation-delay: 1s;"/>
                        <rect x="65" y="40" width="8" height="45" fill="url(#chartGradient)" class="animate-pulse" style="animation-delay: 1.5s;"/>
                        <circle cx="50" cy="20" r="15" fill="none" stroke="#264555" stroke-width="2" class="animate-rotate-slow"/>
                        <line x1="50" y1="10" x2="50" y2="15" stroke="#E3BB62" stroke-width="2"/>
                    </svg>
                </div>
                <h3 class="text-xl font-outfit font-semibold text-graphite mb-4">Visual Intelligence</h3>
                <p class="mb-6 leading-relaxed" style="color: rgba(28, 28, 30, 0.7);">Say goodbye to boring charts. Hello to cinematic dashboards.</p>
                <div class="space-y-2">
                    <div class="service-feature"><div class="service-feature-dot animate-pulse"></div>Live diagnostics</div>
                    <div class="service-feature"><div class="service-feature-dot animate-pulse"></div>Color-coded insights</div>
                    <div class="service-feature"><div class="service-feature-dot animate-pulse"></div>PDF & PPT export</div>
                </div>
                <div class="service-bar"></div>
            </div>

            <!-- Service Card 3 -->
            <div class="service-card glass-effect-light animate-fade-in-up" style="animation-delay: 0.4s;">
                <div class="service-icon">
                    <svg viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#264555"/>
                                <stop offset="100%" stop-color="#E3BB62"/>
                            </linearGradient>
                        </defs>
                        <rect x="25" y="20" width="50" height="60" rx="5" fill="url(#bookGradient)" opacity="0.8"/>
                        <line x1="35" y1="35" x2="65" y2="35" stroke="#FAFAF7" stroke-width="2" class="animate-pulse"/>
                        <line x1="35" y1="45" x2="60" y2="45" stroke="#FAFAF7" stroke-width="1" class="animate-pulse" style="animation-delay: 0.5s;"/>
                        <line x1="35" y1="55" x2="55" y2="55" stroke="#FAFAF7" stroke-width="1" class="animate-pulse" style="animation-delay: 1s;"/>
                        <circle cx="80" cy="25" r="8" fill="#E3BB62" class="animate-float"/>
                        <path d="M76 25 L78 27 L84 21" stroke="#264555" stroke-width="2" fill="none"/>
                    </svg>
                </div>
                <h3 class="text-xl font-outfit font-semibold text-graphite mb-4">Tailored Playbooks</h3>
                <p class="mb-6 leading-relaxed" style="color: rgba(28, 28, 30, 0.7);">You don't just get a score — you get a path.</p>
                <div class="space-y-2">
                    <div class="service-feature"><div class="service-feature-dot animate-pulse"></div>Curated recommendations</div>
                    <div class="service-feature"><div class="service-feature-dot animate-pulse"></div>KPI alignment</div>
                    <div class="service-feature"><div class="service-feature-dot animate-pulse"></div>Integration-ready</div>
                </div>
                <div class="service-bar"></div>
            </div>

            <!-- Service Card 4 -->
            <div class="service-card glass-effect-light animate-fade-in-up" style="animation-delay: 0.6s;">
                <div class="service-icon">
                    <svg viewBox="0 0 100 100">
                        <defs>
                            <linearGradient id="magicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#D2C9B9"/>
                                <stop offset="50%" stop-color="#E3BB62"/>
                                <stop offset="100%" stop-color="#264555"/>
                            </linearGradient>
                        </defs>
                        <path d="M50 10 L55 25 L70 20 L60 35 L75 40 L60 45 L70 60 L55 55 L50 70 L45 55 L30 60 L40 45 L25 40 L40 35 L30 20 L45 25 Z" fill="url(#magicGradient)" class="animate-rotate-slow"/>
                        <circle cx="50" cy="50" r="8" fill="#FAFAF7" class="animate-pulse"/>
                        <circle cx="30" cy="85" r="1.5" fill="#E3BB62" class="animate-ping" style="animation-delay: 0s;"/>
                        <circle cx="38" cy="85" r="1.5" fill="#E3BB62" class="animate-ping" style="animation-delay: 0.2s;"/>
                        <circle cx="46" cy="85" r="1.5" fill="#E3BB62" class="animate-ping" style="animation-delay: 0.4s;"/>
                        <circle cx="54" cy="85" r="1.5" fill="#E3BB62" class="animate-ping" style="animation-delay: 0.6s;"/>
                        <circle cx="62" cy="85" r="1.5" fill="#E3BB62" class="animate-ping" style="animation-delay: 0.8s;"/>
                        <circle cx="70" cy="85" r="1.5" fill="#E3BB62" class="animate-ping" style="animation-delay: 1s;"/>
                    </svg>
                </div>
                <h3 class="text-xl font-outfit font-semibold text-graphite mb-4">White-Label Magic</h3>
                <p class="mb-6 leading-relaxed" style="color: rgba(28, 28, 30, 0.7);">Want it in your brand? In your language?</p>
                <div class="space-y-2">
                    <div class="service-feature"><div class="service-feature-dot animate-pulse"></div>Fully customizable</div>
                    <div class="service-feature"><div class="service-feature-dot animate-pulse"></div>Multi-tenant</div>
                    <div class="service-feature"><div class="service-feature-dot animate-pulse"></div>Seamless embed</div>
                </div>
                <div class="service-bar"></div>
            </div>
        </div>
    </div>
</section>


<!-- ========== INTERACTIVE DEMO SECTION ========== -->
<section class="py-24 bg-gradient-luxury relative overflow-hidden">
    <!-- Enhanced 3D Background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none" id="demo-particles"></div>

    <div class="container mx-auto px-6 relative z-10 max-w-6xl">
        <div class="text-center mb-16 animate-fade-in-up">
            <h2 class="font-outfit font-bold text-white mb-6" style="font-size: clamp(2rem, 4vw, 3rem);">
                Try the <span class="gradient-text">ICA³ Experience</span>
            </h2>
            <p class="text-xl max-w-2xl mx-auto" style="color: rgba(255,255,255,0.8);">
                Experience our adaptive assessment with different question types and smart logic
            </p>
        </div>

        <div class="max-w-4xl mx-auto">
            <!-- Assessment Container -->
            <div id="assessment-container" class="assessment-container glass-effect animate-scale-in">
                <!-- Progress Bar -->
                <div class="mb-8">
                    <div class="flex justify-between text-sm mb-2" style="color: rgba(255,255,255,0.6);">
                        <span>Question <span id="current-step">1</span> of <span id="total-steps">6</span></span>
                        <span><span id="progress-percent">0</span>% Complete</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill" style="width: 0%;"></div>
                    </div>
                </div>

                <!-- Question with Icon -->
                <div class="flex items-center justify-center mb-8">
                    <div class="question-icon animate-float" id="question-icon"></div>
                    <h3 class="font-outfit font-semibold text-white text-center flex-1" style="font-size: clamp(1.25rem, 3vw, 1.875rem);" id="question-text"></h3>
                </div>

                <!-- Question Input Area -->
                <div class="mb-8" id="question-input"></div>

                <!-- Navigation Buttons -->
                <div class="flex justify-between items-center">
                    <button class="nav-btn prev magnetic-button" id="prev-btn" onclick="prevQuestion()" disabled>
                        <svg class="icon icon-sm mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                        Previous
                    </button>

                    <div class="flex gap-2" id="step-dots"></div>

                    <button class="nav-btn next magnetic-button" id="next-btn" onclick="nextQuestion()" disabled>
                        Next
                        <svg class="icon icon-sm ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </button>

                    <button class="nav-btn submit magnetic-button hidden" id="submit-btn" onclick="submitAssessment()" disabled>
                        <svg class="icon icon-sm mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                        Submit
                    </button>
                </div>
            </div>

            <!-- Results Container -->
            <div id="results-container" class="assessment-container glass-effect animate-scale-in hidden text-center">
                <div class="mb-8">
                    <div class="result-circle">
                        <div class="result-inner">
                            <div class="text-3xl font-bold" id="result-score">0%</div>
                            <div class="text-sm" style="color: rgba(255,255,255,0.6);">Maturity</div>
                        </div>
                    </div>
                    
                    <h3 class="text-3xl font-outfit font-bold text-white mb-4">
                        Your Digital Maturity: <span class="gradient-text" id="result-label">Developing</span>
                    </h3>
                </div>

                <div class="flex flex-col gap-4 justify-center" style="flex-direction: row; flex-wrap: wrap;">
                    <button class="btn btn-primary magnetic-button font-semibold">
                        Get Full Assessment Report
                    </button>
                    <button class="btn btn-outline glass-effect magnetic-button" onclick="resetAssessment()">
                        <svg class="icon icon-sm mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="1 4 1 10 7 10"/>
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                        </svg>
                        Start New Assessment
                    </button>
                </div>
            </div>
        </div>

        <!-- Completely Redesigned Smart Logic Section -->
        <div class="mt-32 max-w-7xl mx-auto">
            <div class="text-center mb-16">
                <h3 class="font-outfit font-bold text-white mb-8" style="font-size: clamp(2.5rem, 5vw, 3.75rem);">
                    Powered by <span class="gradient-text relative">
                        Smart Logic
                        <div class="absolute" style="top: -16px; right: -16px;">
                            <div class="rounded-full flex items-center justify-center animate-spin" style="width: 48px; height: 48px; background: rgba(227, 187, 98, 0.2);">
                                <svg class="text-gold" style="width: 24px; height: 24px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                </svg>
                            </div>
                        </div>
                    </span>
                </h3>
                <p class="text-2xl max-w-4xl mx-auto mb-16 leading-relaxed" style="color: rgba(255,255,255,0.9);">
                    Every question unlocks new possibilities. 
                    <span class="text-gold font-semibold"> Watch your assessment adapt </span>
                    in real-time as our intelligent system creates a unique pathway just for you.
                </p>
            </div>

            <!-- Interactive Connection Grid -->
            <div class="relative mb-20">
                <div class="grid grid-cols-2 gap-8 relative md-grid-cols-3 lg-grid-cols-6">
                    <!-- Assessment Areas -->
                    <div class="relative text-center">
                        <div class="mx-auto rounded-2xl flex items-center justify-center shadow-2xl animate-pulse" style="width: 96px; height: 96px; background: linear-gradient(135deg, #3B82F6, #2563EB); animation-delay: 0s; animation-duration: 3s;">
                            <svg style="width: 48px; height: 48px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                        </div>
                        <p class="text-white text-center mt-4 font-semibold text-lg">Security</p>
                    </div>
                    <div class="relative text-center">
                        <div class="mx-auto rounded-2xl flex items-center justify-center shadow-2xl animate-pulse" style="width: 96px; height: 96px; background: linear-gradient(135deg, #8B5CF6, #7C3AED); animation-delay: 0.5s; animation-duration: 3s;">
                            <svg style="width: 48px; height: 48px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
                            </svg>
                        </div>
                        <p class="text-white text-center mt-4 font-semibold text-lg">Infrastructure</p>
                    </div>
                    <div class="relative text-center">
                        <div class="mx-auto rounded-2xl flex items-center justify-center shadow-2xl animate-pulse" style="width: 96px; height: 96px; background: linear-gradient(135deg, #10B981, #059669); animation-delay: 1s; animation-duration: 3s;">
                            <svg style="width: 48px; height: 48px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                            </svg>
                        </div>
                        <p class="text-white text-center mt-4 font-semibold text-lg">Analytics</p>
                    </div>
                    <div class="relative text-center">
                        <div class="mx-auto rounded-2xl flex items-center justify-center shadow-2xl animate-pulse" style="width: 96px; height: 96px; background: linear-gradient(135deg, #F97316, #EA580C); animation-delay: 1.5s; animation-duration: 3s;">
                            <svg style="width: 48px; height: 48px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <p class="text-white text-center mt-4 font-semibold text-lg">Team</p>
                    </div>
                    <div class="relative text-center">
                        <div class="mx-auto rounded-2xl flex items-center justify-center shadow-2xl animate-pulse" style="width: 96px; height: 96px; background: linear-gradient(135deg, #EF4444, #DC2626); animation-delay: 2s; animation-duration: 3s;">
                            <svg style="width: 48px; height: 48px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                            </svg>
                        </div>
                        <p class="text-white text-center mt-4 font-semibold text-lg">Operations</p>
                    </div>
                    <div class="relative text-center">
                        <div class="mx-auto rounded-2xl flex items-center justify-center shadow-2xl animate-pulse" style="width: 96px; height: 96px; background: linear-gradient(135deg, #E3BB62, #EAB308); animation-delay: 2.5s; animation-duration: 3s;">
                            <svg style="width: 48px; height: 48px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                            </svg>
                        </div>
                        <p class="text-white text-center mt-4 font-semibold text-lg">Growth</p>
                    </div>
                </div>

                <!-- Flowing Data Particles -->
                <div class="absolute inset-0 overflow-hidden pointer-events-none" id="flow-particles"></div>
            </div>

            <!-- Smart Features Showcase -->
            <div class="grid grid-cols-1 gap-8 mb-16 md-grid-cols-3">
                <div class="smart-feature-card glass-effect">
                    <div class="smart-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-pulse">
                            <path d="M12 2a9 9 0 0 1 9 9c0 3.87-2.13 7.25-5.28 9.03a1 1 0 0 1-1.14-.1L12 18l-2.58 1.93a1 1 0 0 1-1.14.1C5.13 18.25 3 14.87 3 11a9 9 0 0 1 9-9Z"/>
                        </svg>
                    </div>
                    <h4 class="text-2xl font-outfit font-bold text-white mb-4 text-center">Dynamic Adaptation</h4>
                    <p class="text-center text-lg leading-relaxed" style="color: rgba(255,255,255,0.8);">
                        Questions evolve based on your answers. No two assessments follow the same path.
                    </p>
                </div>
                
                <div class="smart-feature-card glass-effect" style="animation-delay: 0.2s;">
                    <div class="smart-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-pulse" style="animation-delay: 1s;">
                            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                        </svg>
                    </div>
                    <h4 class="text-2xl font-outfit font-bold text-white mb-4 text-center">Precision Focus</h4>
                    <p class="text-center text-lg leading-relaxed" style="color: rgba(255,255,255,0.8);">
                        Skip irrelevant areas and dive deep into what matters most for your business.
                    </p>
                </div>
                
                <div class="smart-feature-card glass-effect" style="animation-delay: 0.4s;">
                    <div class="smart-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-pulse" style="animation-delay: 2s;">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                        </svg>
                    </div>
                    <h4 class="text-2xl font-outfit font-bold text-white mb-4 text-center">Instant Intelligence</h4>
                    <p class="text-center text-lg leading-relaxed" style="color: rgba(255,255,255,0.8);">
                        Get comprehensive insights in minutes with our optimized question flow.
                    </p>
                </div>
            </div>

            <!-- Interactive Flow Demonstration -->
            <div class="glass-effect rounded-3xl p-12 relative overflow-hidden" style="background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(227, 187, 98, 0.1)); border: 1px solid rgba(227, 187, 98, 0.3);">
                <div class="absolute inset-0 animate-pulse" style="background: linear-gradient(90deg, transparent, rgba(227, 187, 98, 0.05), transparent);"></div>
                
                <div class="text-center mb-12 relative z-10">
                    <h4 class="text-3xl font-outfit font-bold text-white mb-6">
                        See Smart Logic in Action
                    </h4>
                    <p class="text-xl max-w-4xl mx-auto" style="color: rgba(255,255,255,0.9);">
                        Watch how each answer creates a cascade of intelligent connections, 
                        revealing the perfect questions for your unique situation.
                    </p>
                </div>

                <!-- Flow Visualization -->
                <div class="flex items-center justify-center gap-8 flex-wrap">
                    <div class="flex flex-col items-center gap-4">
                        <div class="rounded-2xl flex items-center justify-center animate-bounce" style="width: 64px; height: 64px; background: rgba(227, 187, 98, 0.3);">
                            <span class="text-white font-bold text-xl">Q1</span>
                        </div>
                        <p class="text-sm text-center" style="color: rgba(255,255,255,0.7);">Your Answer</p>
                    </div>

                    <svg class="text-gold animate-pulse" style="width: 32px; height: 32px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>

                    <div class="flex flex-col items-center gap-4">
                        <div class="rounded-2xl flex items-center justify-center animate-pulse" style="width: 64px; height: 64px; background: linear-gradient(135deg, #3B82F6, #8B5CF6);">
                            <svg style="width: 32px; height: 32px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2a9 9 0 0 1 9 9c0 3.87-2.13 7.25-5.28 9.03a1 1 0 0 1-1.14-.1L12 18l-2.58 1.93a1 1 0 0 1-1.14.1C5.13 18.25 3 14.87 3 11a9 9 0 0 1 9-9Z"/>
                            </svg>
                        </div>
                        <p class="text-sm text-center" style="color: rgba(255,255,255,0.7);">Smart Analysis</p>
                    </div>

                    <svg class="text-gold animate-pulse" style="width: 32px; height: 32px; animation-delay: 0.5s;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>

                    <div class="grid grid-cols-2 gap-3">
                        <div class="rounded-xl flex items-center justify-center animate-pulse" style="width: 48px; height: 48px; background: rgba(227, 187, 98, 0.2); animation-delay: 1s;"><span class="text-white font-semibold text-sm">Q2</span></div>
                        <div class="rounded-xl flex items-center justify-center animate-pulse" style="width: 48px; height: 48px; background: rgba(227, 187, 98, 0.2); animation-delay: 1.3s;"><span class="text-white font-semibold text-sm">Q3</span></div>
                        <div class="rounded-xl flex items-center justify-center animate-pulse" style="width: 48px; height: 48px; background: rgba(227, 187, 98, 0.2); animation-delay: 1.6s;"><span class="text-white font-semibold text-sm">Q4</span></div>
                        <div class="rounded-xl flex items-center justify-center animate-pulse" style="width: 48px; height: 48px; background: rgba(227, 187, 98, 0.2); animation-delay: 1.9s;"><span class="text-white font-semibold text-sm">Q5</span></div>
                    </div>
                </div>

                <div class="text-center mt-8">
                    <p class="text-gold font-semibold text-lg">
                        ✨ Every path is unique, every insight is tailored ✨
                    </p>
                </div>
            </div>
        </div>
    </div>
</section>


<!-- ========== PROFESSIONALS SECTION ========== -->
<section class="py-24 bg-white relative overflow-hidden">
    <!-- 3D Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute opacity-5" style="top: 33%; left: 25%; width: 256px; height: 256px;">
            <div class="w-full h-full rounded-full animate-pulse blur-3xl" style="background: radial-gradient(circle, rgba(227, 187, 98, 0.3), transparent);"></div>
        </div>
        <div class="absolute opacity-5" style="bottom: 25%; right: 25%; width: 192px; height: 192px;">
            <div class="w-full h-full rounded-full animate-float blur-2xl" style="background: radial-gradient(circle, rgba(38, 69, 85, 0.4), transparent);"></div>
        </div>
    </div>

    <div class="container mx-auto px-6 relative z-10">
        <div class="text-center mb-16 animate-fade-in-up">
            <h2 class="font-outfit font-bold text-graphite mb-6" style="font-size: clamp(2rem, 4vw, 3rem);">
                Designed for Professionals 
                <span class="gradient-text"> Who Decide</span>
            </h2>
            <p class="text-xl max-w-3xl mx-auto" style="color: rgba(28, 28, 30, 0.7);">
                Tailored experiences for every role in your digital transformation journey
            </p>
        </div>

        <div class="grid grid-cols-1 gap-8 max-w-6xl mx-auto md-grid-cols-2">
            <!-- CIO Card -->
            <div class="pro-card glass-effect animate-fade-in-up" style="animation-delay: 0s;">
                <div class="pro-card-bg" style="background: linear-gradient(135deg, #3B82F6, #2563EB);"></div>
                <div class="relative z-10">
                    <div class="pro-icon">
                        <svg viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="cioGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#60A5FA"/>
                                    <stop offset="100%" stop-color="#2563EB"/>
                                </linearGradient>
                            </defs>
                            <rect x="20" y="25" width="60" height="50" rx="5" fill="url(#cioGradient)" opacity="0.8"/>
                            <rect x="30" y="35" width="40" height="2" fill="white" class="animate-pulse"/>
                            <rect x="30" y="45" width="30" height="2" fill="white" class="animate-pulse" style="animation-delay: 0.5s;"/>
                            <rect x="30" y="55" width="35" height="2" fill="white" class="animate-pulse" style="animation-delay: 1s;"/>
                            <circle cx="50" cy="15" r="8" fill="#E3BB62" class="animate-float"/>
                            <path d="M46 12 L48 14 L54 8" stroke="#264555" stroke-width="2" fill="none"/>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-outfit font-bold mb-3">For CIOs</h3>
                    <p class="text-lg font-semibold mb-4" style="background: linear-gradient(135deg, #3B82F6, #2563EB); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Strategic clarity in 10 minutes.</p>
                    <p style="color: rgba(255,255,255,0.8);" class="leading-relaxed">Transform complex IT landscapes into executive-ready insights that drive decision-making and budget allocation.</p>
                    <div class="pro-bar" style="background: linear-gradient(135deg, #3B82F6, #2563EB);"></div>
                </div>
            </div>

            <!-- Consultant Card -->
            <div class="pro-card glass-effect animate-fade-in-up" style="animation-delay: 0.1s;">
                <div class="pro-card-bg" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);"></div>
                <div class="relative z-10">
                    <div class="pro-icon">
                        <svg viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="consultantGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#A78BFA"/>
                                    <stop offset="100%" stop-color="#7C3AED"/>
                                </linearGradient>
                            </defs>
                            <circle cx="50" cy="30" r="15" fill="url(#consultantGradient)" opacity="0.8"/>
                            <rect x="35" y="50" width="30" height="35" rx="3" fill="url(#consultantGradient)" opacity="0.6"/>
                            <line x1="25" y1="60" x2="75" y2="60" stroke="#E3BB62" stroke-width="3" class="animate-pulse"/>
                            <circle cx="20" cy="20" r="3" fill="#E3BB62" class="animate-ping"/>
                            <circle cx="80" cy="80" r="3" fill="#E3BB62" class="animate-ping" style="animation-delay: 1s;"/>
                            <path d="M60 25 L65 30 L75 20" stroke="#E3BB62" stroke-width="2" fill="none" class="animate-pulse"/>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-outfit font-bold mb-3">For Consultants</h3>
                    <p class="text-lg font-semibold mb-4" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Data-driven impact.</p>
                    <p style="color: rgba(255,255,255,0.8);" class="leading-relaxed">Deliver compelling client assessments with visual reports that showcase transformation opportunities and ROI potential.</p>
                    <div class="pro-bar" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);"></div>
                </div>
            </div>

            <!-- Security Lead Card -->
            <div class="pro-card glass-effect animate-fade-in-up" style="animation-delay: 0.2s;">
                <div class="pro-card-bg" style="background: linear-gradient(135deg, #EF4444, #DC2626);"></div>
                <div class="relative z-10">
                    <div class="pro-icon">
                        <svg viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="securityLeadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#F87171"/>
                                    <stop offset="100%" stop-color="#DC2626"/>
                                </linearGradient>
                            </defs>
                            <path d="M50 10 L30 25 L30 60 C30 70 40 80 50 85 C60 80 70 70 70 60 L70 25 Z" fill="url(#securityLeadGradient)" opacity="0.8"/>
                            <circle cx="50" cy="45" r="8" fill="#E3BB62" class="animate-pulse"/>
                            <rect x="47" y="35" width="6" height="8" fill="#264555"/>
                            <circle cx="50" cy="35" r="4" fill="none" stroke="#264555" stroke-width="2"/>
                            <circle cx="30" cy="75" r="1" fill="#E3BB62" class="animate-ping" style="animation-delay: 0s;"/>
                            <circle cx="38" cy="75" r="1" fill="#E3BB62" class="animate-ping" style="animation-delay: 0.2s;"/>
                            <circle cx="46" cy="75" r="1" fill="#E3BB62" class="animate-ping" style="animation-delay: 0.4s;"/>
                            <circle cx="54" cy="75" r="1" fill="#E3BB62" class="animate-ping" style="animation-delay: 0.6s;"/>
                            <circle cx="62" cy="75" r="1" fill="#E3BB62" class="animate-ping" style="animation-delay: 0.8s;"/>
                            <circle cx="70" cy="75" r="1" fill="#E3BB62" class="animate-ping" style="animation-delay: 1s;"/>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-outfit font-bold mb-3">For Security Leads</h3>
                    <p class="text-lg font-semibold mb-4" style="background: linear-gradient(135deg, #EF4444, #DC2626); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Maturity you can trust.</p>
                    <p style="color: rgba(255,255,255,0.8);" class="leading-relaxed">Assess security posture across multiple dimensions with industry-standard frameworks and compliance mapping.</p>
                    <div class="pro-bar" style="background: linear-gradient(135deg, #EF4444, #DC2626);"></div>
                </div>
            </div>

            <!-- CEO Card -->
            <div class="pro-card glass-effect animate-fade-in-up" style="animation-delay: 0.3s;">
                <div class="pro-card-bg" style="background: linear-gradient(135deg, #10B981, #059669);"></div>
                <div class="relative z-10">
                    <div class="pro-icon">
                        <svg viewBox="0 0 100 100">
                            <defs>
                                <linearGradient id="ceoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="#34D399"/>
                                    <stop offset="100%" stop-color="#059669"/>
                                </linearGradient>
                            </defs>
                            <polygon points="50,15 65,35 80,35 70,50 75,65 50,55 25,65 30,50 20,35 35,35" fill="url(#ceoGradient)" opacity="0.8" class="animate-rotate-slow"/>
                            <circle cx="50" cy="50" r="12" fill="#E3BB62" class="animate-pulse"/>
                            <path d="M45 48 L48 52 L55 44" stroke="#264555" stroke-width="3" fill="none"/>
                            <circle cx="25" cy="25" r="2" fill="#E3BB62" class="animate-ping"/>
                            <circle cx="75" cy="25" r="2" fill="#E3BB62" class="animate-ping" style="animation-delay: 0.5s;"/>
                            <circle cx="50" cy="85" r="2" fill="#E3BB62" class="animate-ping" style="animation-delay: 1s;"/>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-outfit font-bold mb-3">For CEOs</h3>
                    <p class="text-lg font-semibold mb-4" style="background: linear-gradient(135deg, #10B981, #059669); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Insights without the jargon.</p>
                    <p style="color: rgba(255,255,255,0.8);" class="leading-relaxed">Get the big picture of your digital readiness with clear, actionable intelligence that translates to business value.</p>
                    <div class="pro-bar" style="background: linear-gradient(135deg, #10B981, #059669);"></div>
                </div>
            </div>
        </div>

        <!-- Central Quote -->
        <div class="mt-20 text-center animate-fade-in-up" style="animation-delay: 0.5s;">
            <blockquote class="font-outfit font-light italic max-w-4xl mx-auto" style="font-size: clamp(1.5rem, 3vw, 1.875rem); color: rgba(28, 28, 30, 0.8);">
                "We help our clients understand where they are and where they're meant to be."
            </blockquote>
            <div class="mt-6 mx-auto rounded-full animate-pulse" style="width: 96px; height: 4px; background: linear-gradient(135deg, #E3BB62 0%, #D2C9B9 100%);"></div>
        </div>
    </div>
</section>


<!-- ========== DATA VISUALIZATION SECTION ========== -->
<section class="py-24 relative overflow-hidden" style="background: linear-gradient(135deg, #D2C9B9, #FAFAF7);">
    <!-- Enhanced 3D Background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute opacity-10" style="top: 25%; left: 16.66%; width: 192px; height: 192px;">
            <div class="w-full h-full rounded-full animate-float blur-2xl" style="background: radial-gradient(circle, rgba(227, 187, 98, 0.4), transparent);"></div>
        </div>
        <div class="absolute opacity-5" style="bottom: 33%; right: 16.66%; width: 256px; height: 256px;">
            <div class="w-full h-full rounded-full animate-pulse blur-3xl" style="background: radial-gradient(circle, rgba(38, 69, 85, 0.3), transparent);"></div>
        </div>
        <!-- Floating geometric shapes -->
        <div class="absolute opacity-20" style="top: 33%; right: 25%; width: 64px; height: 64px;">
            <div class="w-full h-full rounded-lg rotate-45 animate-rotate-slow" style="background: linear-gradient(135deg, rgba(227, 187, 98, 0.3), rgba(38, 69, 85, 0.3));"></div>
        </div>
    </div>

    <div class="container mx-auto px-6 relative z-10">
        <div class="grid grid-cols-1 gap-16 items-center lg-grid-cols-2">
            <!-- Left Content -->
            <div class="animate-fade-in-up">
                <h2 class="font-outfit font-bold text-graphite mb-8" style="font-size: clamp(2rem, 4vw, 3rem);">
                    Data, but Make It 
                    <span class="gradient-text"> Beautiful</span>
                </h2>
                
                <p class="text-xl mb-8 leading-relaxed" style="color: rgba(28, 28, 30, 0.7);">
                    Transform raw assessment data into compelling visual narratives that 
                    stakeholders actually want to engage with.
                </p>

                <div class="space-y-6">
                    <div class="data-feature">
                        <div class="data-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 10.93 5.16-1.191 9-5.38 9-10.93V7l-10-5z"/>
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-graphite mb-2">Interactive Radar Charts</h3>
                            <p style="color: rgba(28, 28, 30, 0.6);">Multi-dimensional assessments visualized with animated radar plots that highlight strengths and opportunities.</p>
                        </div>
                    </div>

                    <div class="data-feature">
                        <div class="data-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="16" rx="2"/>
                                <rect x="7" y="10" width="2" height="6" fill="currentColor" class="animate-pulse"/>
                                <rect x="11" y="8" width="2" height="8" fill="currentColor" class="animate-pulse" style="animation-delay: 0.3s;"/>
                                <rect x="15" y="6" width="2" height="10" fill="currentColor" class="animate-pulse" style="animation-delay: 0.6s;"/>
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-graphite mb-2">Dynamic Scorecards</h3>
                            <p style="color: rgba(28, 28, 30, 0.6);">Real-time scoring with contextual tooltips that explain the meaning behind every metric.</p>
                        </div>
                    </div>

                    <div class="data-feature">
                        <div class="data-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-graphite mb-2">Executive Summaries</h3>
                            <p style="color: rgba(28, 28, 30, 0.6);">One-page insights designed for C-suite consumption with actionable next steps.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Dashboard Preview -->
            <div class="animate-scale-in" style="animation-delay: 0.3s;">
                <div class="dashboard-preview glass-effect-light rounded-3xl shadow-2xl p-8 relative overflow-hidden" style="background: rgba(38, 69, 85, 0.4); border: 1px solid rgba(227, 187, 98, 0.2);">
                    <!-- Mock Dashboard -->
                    <div class="mb-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-xl font-semibold text-bone">Digital Maturity Overview</h3>
                            <div class="rounded-full animate-pulse" style="width: 32px; height: 32px; background: linear-gradient(135deg, #E3BB62, #D2C9B9);"></div>
                        </div>
                        
                        <!-- Score Circles -->
                        <div class="grid grid-cols-3 gap-4 mb-8">
                            <div class="text-center">
                                <div class="mx-auto mb-2 relative" style="width: 64px; height: 64px;">
                                    <div class="w-full h-full rounded-full relative" style="border: 4px solid rgba(107, 114, 128, 0.4);">
                                        <div class="absolute inset-0 rounded-full animate-pulse" style="border: 4px solid #22C55E; clip-path: circle(50% at 50% 50%); transform: rotate(288deg);"></div>
                                        <div class="absolute inset-0 flex items-center justify-center text-sm font-bold" style="color: #22C55E;">80%</div>
                                    </div>
                                </div>
                                <div class="text-xs" style="color: rgba(250, 250, 247, 0.6);">Security</div>
                            </div>

                            <div class="text-center">
                                <div class="mx-auto mb-2 relative" style="width: 64px; height: 64px;">
                                    <div class="w-full h-full rounded-full relative" style="border: 4px solid rgba(107, 114, 128, 0.4);">
                                        <div class="absolute inset-0 rounded-full animate-pulse" style="border: 4px solid #EAB308; clip-path: circle(50% at 50% 50%); transform: rotate(216deg); animation-delay: 0.5s;"></div>
                                        <div class="absolute inset-0 flex items-center justify-center text-sm font-bold" style="color: #EAB308;">60%</div>
                                    </div>
                                </div>
                                <div class="text-xs" style="color: rgba(250, 250, 247, 0.6);">Infrastructure</div>
                            </div>

                            <div class="text-center">
                                <div class="mx-auto mb-2 relative" style="width: 64px; height: 64px;">
                                    <div class="w-full h-full rounded-full relative" style="border: 4px solid rgba(107, 114, 128, 0.4);">
                                        <div class="absolute inset-0 rounded-full animate-pulse" style="border: 4px solid #3B82F6; clip-path: circle(50% at 50% 50%); transform: rotate(324deg); animation-delay: 1s;"></div>
                                        <div class="absolute inset-0 flex items-center justify-center text-sm font-bold" style="color: #3B82F6;">90%</div>
                                    </div>
                                </div>
                                <div class="text-xs" style="color: rgba(250, 250, 247, 0.6);">Innovation</div>
                            </div>
                        </div>

                        <!-- Progress Bars -->
                        <div class="space-y-4">
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span style="color: rgba(250, 250, 247, 0.7);">Cloud Adoption</span>
                                    <span class="text-bone">85%</span>
                                </div>
                                <div class="w-full rounded-full h-2" style="background: rgba(107, 114, 128, 0.4);">
                                    <div class="h-2 rounded-full animate-pulse" style="width: 85%; background: linear-gradient(90deg, #3B82F6, #2563EB);"></div>
                                </div>
                            </div>

                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span style="color: rgba(250, 250, 247, 0.7);">Data Governance</span>
                                    <span class="text-bone">72%</span>
                                </div>
                                <div class="w-full rounded-full h-2" style="background: rgba(107, 114, 128, 0.4);">
                                    <div class="h-2 rounded-full animate-pulse" style="width: 72%; background: linear-gradient(90deg, #10B981, #059669); animation-delay: 0.5s;"></div>
                                </div>
                            </div>

                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span style="color: rgba(250, 250, 247, 0.7);">Automation</span>
                                    <span class="text-bone">58%</span>
                                </div>
                                <div class="w-full rounded-full h-2" style="background: rgba(107, 114, 128, 0.4);">
                                    <div class="h-2 rounded-full animate-pulse" style="width: 58%; background: linear-gradient(90deg, #EAB308, #CA8A04); animation-delay: 1s;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Floating Elements -->
                    <div class="absolute rounded-full animate-float" style="top: -16px; right: -16px; width: 32px; height: 32px; background: rgba(227, 187, 98, 0.2);"></div>
                    <div class="absolute rounded-full animate-float" style="bottom: -8px; left: -8px; width: 24px; height: 24px; background: rgba(227, 187, 98, 0.3); animation-delay: 1s;"></div>
                    <div class="absolute rounded-full animate-ping" style="top: 50%; left: -16px; width: 16px; height: 16px; background: rgba(210, 201, 185, 0.4);"></div>
                </div>
            </div>
        </div>
    </div>
</section>


<!-- ========== CTA SECTION ========== -->
<section class="py-24 bg-gradient-luxury relative overflow-hidden">
    <!-- Background Effects -->
    <div class="absolute inset-0">
        <div class="absolute rounded-full blur-3xl animate-float" style="top: 25%; left: 25%; width: 256px; height: 256px; background: rgba(227, 187, 98, 0.1);"></div>
        <div class="absolute rounded-full blur-2xl animate-float" style="bottom: 25%; right: 25%; width: 192px; height: 192px; background: rgba(227, 187, 98, 0.05); animation-delay: 2s;"></div>
    </div>

    <div class="container mx-auto px-6 relative z-10">
        <div class="max-w-4xl mx-auto text-center animate-fade-in-up">
            <h2 class="font-outfit font-bold text-white mb-8 leading-tight" style="font-size: clamp(2rem, 5vw, 3.75rem);">
                Start for <span class="gradient-text">free</span>.<br>
                No credit card.<br>
                No commitment.<br>
                <span class="font-light" style="font-size: clamp(1.5rem, 4vw, 2.25rem);">Just intelligence.</span>
            </h2>

            <p class="text-xl mb-12 max-w-2xl mx-auto leading-relaxed" style="color: rgba(255,255,255,0.8);">
                Join hundreds of organizations already transforming their digital maturity 
                assessments with ICA³. Your first assessment is completely free.
            </p>

            <div class="flex flex-col gap-6 justify-center items-center mb-16" style="flex-direction: row; flex-wrap: wrap;">
                <button class="btn btn-primary magnetic-button font-semibold" style="padding: 20px 48px; font-size: 1.25rem; border-radius: 16px;">
                    Start Now — It's Free
                </button>
                
                <button class="btn btn-outline glass-effect magnetic-button" style="padding: 20px 48px; font-size: 1.25rem; border-radius: 16px;">
                    Explore Pricing Plans
                </button>
            </div>

            <!-- Enhanced Creative Trust Badges -->
            <div class="grid grid-cols-1 gap-8 max-w-5xl mx-auto md-grid-cols-3">
                <!-- ISO-ready Badge -->
                <div class="trust-badge relative overflow-hidden">
                    <div class="absolute inset-0 opacity-0" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1), transparent);"></div>
                    <div class="absolute rounded-full animate-pulse" style="top: 16px; right: 16px; width: 64px; height: 64px; background: rgba(16, 185, 129, 0.1);"></div>
                    <div class="relative z-10">
                        <div class="mx-auto mb-6 relative" style="width: 96px; height: 96px;">
                            <svg viewBox="0 0 120 120" class="w-full h-full">
                                <defs>
                                    <linearGradient id="isoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stop-color="#10B981"/>
                                        <stop offset="50%" stop-color="#059669"/>
                                        <stop offset="100%" stop-color="#047857"/>
                                    </linearGradient>
                                </defs>
                                <path d="M60 10 L90 25 L90 55 Q90 75 60 95 Q30 75 30 55 L30 25 Z" fill="url(#isoGradient)" class="animate-pulse"/>
                                <path d="M60 20 L80 30 L80 50 Q80 65 60 80 Q40 65 40 50 L40 30 Z" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
                                <path d="M45 55 L55 65 L75 45" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="animate-pulse"/>
                                <circle cx="35" cy="35" r="2" fill="#10B981" opacity="0.7">
                                    <animate attributeName="cy" values="35;25;35" dur="3s" repeatCount="indefinite"/>
                                </circle>
                                <circle cx="85" cy="45" r="1.5" fill="#10B981" opacity="0.5">
                                    <animate attributeName="cy" values="45;35;45" dur="2.5s" repeatCount="indefinite"/>
                                </circle>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold text-white mb-3">ISO-ready</h3>
                        <p style="color: rgba(255,255,255,0.7);" class="leading-relaxed">Built with enterprise security standards in mind</p>
                    </div>
                </div>

                <!-- GDPR Compliant Badge -->
                <div class="trust-badge relative overflow-hidden">
                    <div class="absolute inset-0 opacity-0" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1), transparent);"></div>
                    <div class="absolute rounded-full animate-pulse" style="top: 16px; left: 16px; width: 48px; height: 48px; background: rgba(59, 130, 246, 0.1); animation-delay: 1s;"></div>
                    <div class="relative z-10">
                        <div class="mx-auto mb-6 relative" style="width: 96px; height: 96px;">
                            <svg viewBox="0 0 120 120" class="w-full h-full">
                                <defs>
                                    <linearGradient id="gdprGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stop-color="#3B82F6"/>
                                        <stop offset="50%" stop-color="#2563EB"/>
                                        <stop offset="100%" stop-color="#1D4ED8"/>
                                    </linearGradient>
                                </defs>
                                <rect x="35" y="50" width="50" height="45" rx="8" fill="url(#gdprGradient)"/>
                                <rect x="50" y="30" width="20" height="25" rx="10" fill="none" stroke="url(#gdprGradient)" stroke-width="4"/>
                                <g fill="white" opacity="0.8">
                                    <circle cx="50" cy="65" r="2">
                                        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
                                    </circle>
                                    <circle cx="60" cy="70" r="1.5">
                                        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                                    </circle>
                                    <circle cx="70" cy="65" r="1.5">
                                        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="1s"/>
                                    </circle>
                                </g>
                                <rect x="52" y="75" width="16" height="2" fill="white" opacity="0.9"/>
                                <rect x="52" y="80" width="12" height="2" fill="white" opacity="0.7"/>
                                <rect x="52" y="85" width="14" height="2" fill="white" opacity="0.6"/>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold text-white mb-3">GDPR Compliant</h3>
                        <p style="color: rgba(255,255,255,0.7);" class="leading-relaxed">Your data stays secure and compliant across Europe</p>
                    </div>
                </div>

                <!-- Enterprise Security Badge -->
                <div class="trust-badge relative overflow-hidden">
                    <div class="absolute inset-0 opacity-0" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.1), transparent);"></div>
                    <div class="absolute rounded-full animate-pulse" style="bottom: 16px; right: 16px; width: 80px; height: 80px; background: rgba(139, 92, 246, 0.1); animation-delay: 2s;"></div>
                    <div class="relative z-10">
                        <div class="mx-auto mb-6 relative" style="width: 96px; height: 96px;">
                            <svg viewBox="0 0 120 120" class="w-full h-full">
                                <defs>
                                    <linearGradient id="enterpriseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stop-color="#8B5CF6"/>
                                        <stop offset="50%" stop-color="#7C3AED"/>
                                        <stop offset="100%" stop-color="#6D28D9"/>
                                    </linearGradient>
                                </defs>
                                <circle cx="60" cy="60" r="25" fill="url(#enterpriseGradient)"/>
                                <circle cx="60" cy="60" r="15" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
                                <circle cx="60" cy="25" r="8" fill="url(#enterpriseGradient)" opacity="0.8">
                                    <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite"/>
                                </circle>
                                <circle cx="95" cy="60" r="6" fill="url(#enterpriseGradient)" opacity="0.7">
                                    <animate attributeName="r" values="6;8;6" dur="2.5s" repeatCount="indefinite"/>
                                </circle>
                                <circle cx="60" cy="95" r="7" fill="url(#enterpriseGradient)" opacity="0.6">
                                    <animate attributeName="r" values="7;9;7" dur="3s" repeatCount="indefinite"/>
                                </circle>
                                <circle cx="25" cy="60" r="5" fill="url(#enterpriseGradient)" opacity="0.8">
                                    <animate attributeName="r" values="5;7;5" dur="2.2s" repeatCount="indefinite"/>
                                </circle>
                                <line x1="60" y1="35" x2="60" y2="45" stroke="rgba(255,255,255,0.4)" stroke-width="2" class="animate-pulse"/>
                                <line x1="85" y1="60" x2="75" y2="60" stroke="rgba(255,255,255,0.4)" stroke-width="2" class="animate-pulse"/>
                                <line x1="60" y1="85" x2="60" y2="75" stroke="rgba(255,255,255,0.4)" stroke-width="2" class="animate-pulse"/>
                                <line x1="35" y1="60" x2="45" y2="60" stroke="rgba(255,255,255,0.4)" stroke-width="2" class="animate-pulse"/>
                                <path d="M52 60 L57 65 L68 54" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold text-white mb-3">Enterprise Security</h3>
                        <p style="color: rgba(255,255,255,0.7);" class="leading-relaxed">Multi-layered security architecture protecting your sensitive data</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
<!-- ========== AUTH MODAL ========== -->
<div class="modal-overlay" id="auth-modal">
    <div class="modal-content">
        <!-- 3D Background Elements -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute rounded-full blur-2xl animate-pulse" style="top: -40px; right: -40px; width: 128px; height: 128px; background: rgba(227, 187, 98, 0.1);"></div>
            <div class="absolute rounded-full blur-xl animate-float" style="bottom: -40px; left: -40px; width: 96px; height: 96px; background: rgba(38, 69, 85, 0.2);"></div>
            
            <!-- Animated geometric shapes -->
            <svg class="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="modalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#E3BB62" stop-opacity="0.3"/>
                        <stop offset="100%" stop-color="#264555" stop-opacity="0.1"/>
                    </linearGradient>
                </defs>
                <polygon points="50,10 90,30 70,70 30,70 10,30" fill="url(#modalGradient)" class="animate-pulse">
                    <animateTransform attributeName="transform" type="rotate" values="0 50 40;360 50 40" dur="20s" repeatCount="indefinite"/>
                </polygon>
            </svg>
        </div>

        <button class="modal-close" onclick="closeAuthModal()">×</button>

        <div class="relative z-10">
            <h2 class="text-2xl font-outfit font-bold text-center gradient-text mb-2" id="modal-title">Welcome Back</h2>
            <p class="text-center text-sm mb-6" style="color: rgba(255,255,255,0.7);" id="modal-subtitle">Sign in to continue your assessment journey</p>

            <!-- Toggle Buttons -->
            <div class="flex mb-6 rounded-xl p-1" style="background: rgba(255,255,255,0.05);">
                <button class="toggle-btn active" id="signin-toggle" onclick="toggleAuth('signin')">Sign In</button>
                <button class="toggle-btn" id="signup-toggle" onclick="toggleAuth('signup')">Sign Up</button>
            </div>

            <form id="auth-form" onsubmit="handleAuthSubmit(event)">
                <!-- Name fields (signup only) -->
                <div class="grid grid-cols-2 gap-4 mb-4 hidden" id="name-fields">
                    <div>
                        <label class="form-label">First Name</label>
                        <input type="text" class="form-input" placeholder="John" name="firstName">
                    </div>
                    <div>
                        <label class="form-label">Last Name</label>
                        <input type="text" class="form-input" placeholder="Doe" name="lastName">
                    </div>
                </div>

                <div class="mb-4">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" placeholder="your@email.com" name="email" required>
                </div>

                <div class="mb-4">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-input" placeholder="••••••••" name="password" required>
                </div>

                <!-- Confirm password (signup only) -->
                <div class="mb-4 hidden" id="confirm-password-field">
                    <label class="form-label">Confirm Password</label>
                    <input type="password" class="form-input" placeholder="••••••••" name="confirmPassword">
                </div>

                <button type="submit" class="btn btn-primary w-full magnetic-button font-semibold mt-6" id="auth-submit-btn">
                    Sign In & Start Assessment
                </button>
            </form>

            <div class="text-center mt-4" id="forgot-password">
                <button class="text-gold text-sm underline">Forgot your password?</button>
            </div>

            <div class="flex items-center justify-center mt-6">
                <div class="flex-1 h-px" style="background: rgba(255,255,255,0.2);"></div>
                <span class="px-4 text-xs" style="color: rgba(255,255,255,0.5);">SECURE & ENCRYPTED</span>
                <div class="flex-1 h-px" style="background: rgba(255,255,255,0.2);"></div>
            </div>
        </div>
    </div>
</div>
  `, []);

  useEffect(() => {
    // ========== ASSESSMENT LOGIC ==========
    const questions = [
        {
            id: 1,
            type: 'scale',
            question: "How would you rate your organization's current digital infrastructure?",
            icon: '<svg viewBox="0 0 24 24" class="w-8 h-8 text-gold" fill="currentColor"><path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 10.93 5.16-1.191 9-5.38 9-10.93V7l-10-5z"/><circle cx="12" cy="12" r="3" fill="#264555" class="animate-pulse"/></svg>',
            min: 1,
            max: 10,
            labels: ['Basic', 'Enterprise-grade']
        },
        {
            id: 2,
            type: 'multiple',
            question: "What's your primary focus for digital transformation?",
            icon: '<svg viewBox="0 0 24 24" class="w-8 h-8 text-gold" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
            options: ["Security & Compliance", "Cloud Migration", "Data Analytics", "Process Automation"]
        },
        {
            id: 3,
            type: 'yesno',
            question: "Do you have a dedicated IT security team?",
            icon: '<svg viewBox="0 0 24 24" class="w-8 h-8 text-gold"><rect x="3" y="11" width="18" height="10" rx="2" ry="2" fill="currentColor" opacity="0.3"/><circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
        },
        {
            id: 4,
            type: 'text',
            question: "What's your biggest challenge in digital transformation?",
            icon: '<svg viewBox="0 0 24 24" class="w-8 h-8 text-gold" fill="currentColor"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
            placeholder: "Tell us about your main challenges..."
        },
        {
            id: 5,
            type: 'multiple',
            question: "What's your organization's size?",
            icon: '<svg viewBox="0 0 24 24" class="w-8 h-8 text-gold" fill="currentColor"><path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.5 7h-5c-.83 0-1.5.67-1.5 1.5v9c0 .83.67 1.5 1.5 1.5H16v2h4z"/><circle cx="12" cy="4" r="2" class="animate-pulse"/><circle cx="6" cy="4" r="2" class="animate-pulse" style="animation-delay: 0.5s;"/></svg>',
            options: ["Small (1-50)", "Medium (51-200)", "Large (201-1000)", "Enterprise (1000+)"]
        },
        {
            id: 6,
            type: 'scale',
            question: "How satisfied are you with your current data analytics capabilities?",
            icon: '<svg viewBox="0 0 24 24" class="w-8 h-8 text-gold" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>',
            min: 1,
            max: 10,
            labels: ['Poor', 'Excellent']
        }
    ];

    let currentStep = 0;
    let answers = {};
    let sliderDragging = false;

    function initAssessment() {
        renderQuestion();
        renderStepDots();
        updateProgress();
        createParticles();
    }

    function renderQuestion() {
        const question = questions[currentStep];
        document.getElementById('question-icon').innerHTML = question.icon;
        document.getElementById('question-text').textContent = question.question;
    
        let inputHTML = '';
    
        switch (question.type) {
            case 'scale':
                const value = answers[currentStep] || 5;
                inputHTML = `
                    <div class="slider-container">
                        <div class="slider-track" id="slider-track" onclick="handleSliderClick(event)">
                            <div class="slider-fill" id="slider-fill" style="width: ${(value - question.min) / (question.max - question.min) * 100}%;"></div>
                            <div class="slider-thumb" id="slider-thumb" style="left: ${(value - question.min) / (question.max - question.min) * 100}%;"></div>
                        </div>
                        <div class="flex justify-between text-sm mt-2" style="color: rgba(255,255,255,0.6);">
                            <span>${question.labels[0]}</span>
                            <span class="text-gold font-semibold" id="slider-value">${value}</span>
                            <span>${question.labels[1]}</span>
                        </div>
                    </div>
                `;
                break;
            
            case 'multiple':
                inputHTML = '<div class="grid grid-cols-1 gap-4 md-grid-cols-2">';
                question.options.forEach((option, index) => {
                    const selected = answers[currentStep] === option;
                    inputHTML += `
                        <button onclick="selectOption('${option}')" class="option-btn magnetic-button ${selected ? 'selected' : ''}">
                            <div class="option-radio ${selected ? 'selected' : ''}"></div>
                            <span class="text-lg">${option}</span>
                        </button>
                    `;
                });
                inputHTML += '</div>';
                break;
            
            case 'yesno':
                const yesSelected = answers[currentStep] === 'yes';
                const noSelected = answers[currentStep] === 'no';
                inputHTML = `
                    <div class="grid grid-cols-2 gap-6">
                        <button onclick="selectYesNo('yes')" class="yesno-btn yes magnetic-button ${yesSelected ? 'selected' : ''}">
                            <div class="text-4xl mb-2">✓</div>
                            <span class="text-xl font-semibold">Yes</span>
                        </button>
                        <button onclick="selectYesNo('no')" class="yesno-btn no magnetic-button ${noSelected ? 'selected' : ''}">
                            <div class="text-4xl mb-2">✗</div>
                            <span class="text-xl font-semibold">No</span>
                        </button>
                    </div>
                `;
                break;
            
            case 'text':
                const textValue = answers[currentStep] || '';
                inputHTML = `
                    <div class="space-y-4">
                        <textarea 
                            id="text-input"
                            class="text-input" 
                            placeholder="${question.placeholder}"
                            oninput="handleTextInput(this.value)"
                        >${textValue}</textarea>
                        <div class="text-sm" style="color: rgba(255,255,255,0.6);">
                            <span id="char-count">${textValue.length}</span> characters (minimum 10)
                        </div>
                    </div>
                `;
                break;
        }
    
        document.getElementById('question-input').innerHTML = inputHTML;
    
        // Setup slider if needed
        if (question.type === 'scale') {
            setupSlider();
        }
    
        updateNavButtons();
    }

    function setupSlider() {
        const thumb = document.getElementById('slider-thumb');
        const track = document.getElementById('slider-track');
    
        if (!thumb || !track) return;
    
        thumb.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
    
        thumb.addEventListener('touchstart', startDrag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', endDrag);
    }

    function startDrag(e) {
        sliderDragging = true;
        e.preventDefault();
    }

    function drag(e) {
        if (!sliderDragging) return;
    
        const track = document.getElementById('slider-track');
        const rect = track.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    
        let percent = (clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
    
        const question = questions[currentStep];
        const value = Math.round(question.min + percent * (question.max - question.min));
    
        updateSlider(value);
        answers[currentStep] = value;
        updateNavButtons();
    }

    function endDrag() {
        sliderDragging = false;
    }

    function handleSliderClick(e) {
        const track = document.getElementById('slider-track');
        const rect = track.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.max(0, Math.min(1, percent));
    
        const question = questions[currentStep];
        const value = Math.round(question.min + percent * (question.max - question.min));
    
        updateSlider(value);
        answers[currentStep] = value;
        updateNavButtons();
    }

    function updateSlider(value) {
        const question = questions[currentStep];
        const percent = (value - question.min) / (question.max - question.min) * 100;
    
        document.getElementById('slider-fill').style.width = percent + '%';
        document.getElementById('slider-thumb').style.left = percent + '%';
        document.getElementById('slider-value').textContent = value;
    }

    function selectOption(option) {
        answers[currentStep] = option;
        renderQuestion();
    }

    function selectYesNo(value) {
        answers[currentStep] = value;
        renderQuestion();
    }

    function handleTextInput(value) {
        answers[currentStep] = value;
        document.getElementById('char-count').textContent = value.length;
        updateNavButtons();
    }

    function renderStepDots() {
        let dotsHTML = '';
        questions.forEach((_, index) => {
            let className = 'step-dot';
            if (index === currentStep) className += ' active';
            else if (index < currentStep) className += ' completed';
            dotsHTML += `<div class="${className}"></div>`;
        });
        document.getElementById('step-dots').innerHTML = dotsHTML;
    }

    function updateProgress() {
        const percent = Math.round((currentStep / questions.length) * 100);
        document.getElementById('progress-fill').style.width = percent + '%';
        document.getElementById('progress-percent').textContent = percent;
        document.getElementById('current-step').textContent = currentStep + 1;
        document.getElementById('total-steps').textContent = questions.length;
    }

    function updateNavButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');
    
        prevBtn.disabled = currentStep === 0;
    
        const isAnswered = isCurrentQuestionAnswered();
    
        if (currentStep === questions.length - 1) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
            submitBtn.disabled = !isAnswered;
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
            nextBtn.disabled = !isAnswered;
        }
    }

    function isCurrentQuestionAnswered() {
        const answer = answers[currentStep];
        const question = questions[currentStep];
    
        if (question.type === 'text') {
            return answer && answer.length >= 10;
        }
        return answer !== undefined;
    }

    function nextQuestion() {
        if (currentStep < questions.length - 1) {
            currentStep++;
            renderQuestion();
            renderStepDots();
            updateProgress();
        }
    }

    function prevQuestion() {
        if (currentStep > 0) {
            currentStep--;
            renderQuestion();
            renderStepDots();
            updateProgress();
        }
    }

    function submitAssessment() {
        let totalScore = 0;
        questions.forEach((question, index) => {
            const answer = answers[index];
            if (answer !== undefined) {
                if (question.type === 'scale') {
                    totalScore += answer * 10;
                } else if (question.type === 'multiple') {
                    totalScore += 75;
                } else if (question.type === 'yesno') {
                    totalScore += answer === 'yes' ? 100 : 50;
                } else if (question.type === 'text') {
                    totalScore += answer.length > 20 ? 90 : 60;
                }
            }
        });
    
        const maxScore = questions.length * 100;
        const finalPercent = Math.round((totalScore / maxScore) * 100);
    
        document.getElementById('assessment-container').classList.add('hidden');
        document.getElementById('results-container').classList.remove('hidden');
    
        document.getElementById('result-score').textContent = finalPercent + '%';
    
        let label = 'Developing';
        let color = '#EF4444';
        if (finalPercent >= 75) {
            label = 'Leading';
            color = '#22C55E';
        } else if (finalPercent >= 50) {
            label = 'Maturing';
            color = '#EAB308';
        }
    
        document.getElementById('result-label').textContent = label;
        document.getElementById('result-score').style.color = color;
    }

    function resetAssessment() {
        currentStep = 0;
        answers = {};
    
        document.getElementById('results-container').classList.add('hidden');
        document.getElementById('assessment-container').classList.remove('hidden');
    
        renderQuestion();
        renderStepDots();
        updateProgress();
    }

    function createParticles() {
        const container = document.getElementById('demo-particles');
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'absolute rounded-full animate-ping';
            particle.style.width = '8px';
            particle.style.height = '8px';
            particle.style.background = 'rgba(227, 187, 98, 0.6)';
            particle.style.top = (20 + Math.random() * 60) + '%';
            particle.style.left = (10 + Math.random() * 80) + '%';
            particle.style.animationDelay = (Math.random() * 3) + 's';
            particle.style.animationDuration = (2 + Math.random() * 3) + 's';
            container.appendChild(particle);
        }
    
        const flowContainer = document.getElementById('flow-particles');
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'absolute rounded-full opacity-60';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = '#E3BB62';
            particle.style.top = (30 + Math.random() * 40) + '%';
            particle.style.left = (Math.random() * 100) + '%';
            particle.style.animation = 'float 4s ease-in-out infinite';
            particle.style.animationDelay = (Math.random() * 4) + 's';
            flowContainer.appendChild(particle);
        }
    }

    // ========== AUTH MODAL LOGIC ==========
    function openAuthModal() {
        document.getElementById('auth-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeAuthModal() {
        document.getElementById('auth-modal').classList.remove('active');
        document.body.style.overflow = '';
    }

    function toggleAuth(type) {
        const signinToggle = document.getElementById('signin-toggle');
        const signupToggle = document.getElementById('signup-toggle');
        const nameFields = document.getElementById('name-fields');
        const confirmField = document.getElementById('confirm-password-field');
        const forgotPassword = document.getElementById('forgot-password');
        const submitBtn = document.getElementById('auth-submit-btn');
        const modalTitle = document.getElementById('modal-title');
        const modalSubtitle = document.getElementById('modal-subtitle');
    
        if (type === 'signin') {
            signinToggle.classList.add('active');
            signupToggle.classList.remove('active');
            nameFields.classList.add('hidden');
            confirmField.classList.add('hidden');
            forgotPassword.classList.remove('hidden');
            submitBtn.textContent = 'Sign In & Start Assessment';
            modalTitle.textContent = 'Welcome Back';
            modalSubtitle.textContent = 'Sign in to continue your assessment journey';
        } else {
            signinToggle.classList.remove('active');
            signupToggle.classList.add('active');
            nameFields.classList.remove('hidden');
            confirmField.classList.remove('hidden');
            forgotPassword.classList.add('hidden');
            submitBtn.textContent = 'Create Account & Begin';
            modalTitle.textContent = 'Join ICA³';
            modalSubtitle.textContent = 'Start your digital maturity assessment today';
        }
    }

    function handleAuthSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        console.log('Form submitted:', Object.fromEntries(formData));
        closeAuthModal();
    }

    // Close modal when clicking overlay
    document.getElementById('auth-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAuthModal();
        }
    });

    // Initialize on load

    // Expose functions for inline HTML handlers
    (window as any).initAssessment = initAssessment;
    (window as any).renderQuestion = renderQuestion;
    (window as any).setupSlider = setupSlider;
    (window as any).startDrag = startDrag;
    (window as any).drag = drag;
    (window as any).endDrag = endDrag;
    (window as any).handleSliderClick = handleSliderClick;
    (window as any).updateSlider = updateSlider;
    (window as any).selectOption = selectOption;
    (window as any).selectYesNo = selectYesNo;
    (window as any).handleTextInput = handleTextInput;
    (window as any).renderStepDots = renderStepDots;
    (window as any).updateProgress = updateProgress;
    (window as any).updateNavButtons = updateNavButtons;
    (window as any).isCurrentQuestionAnswered = isCurrentQuestionAnswered;
    (window as any).nextQuestion = nextQuestion;
    (window as any).prevQuestion = prevQuestion;
    (window as any).submitAssessment = submitAssessment;
    (window as any).resetAssessment = resetAssessment;
    (window as any).createParticles = createParticles;
    (window as any).openAuthModal = openAuthModal;
    (window as any).closeAuthModal = closeAuthModal;
    (window as any).toggleAuth = toggleAuth;
    (window as any).handleAuthSubmit = handleAuthSubmit;

    // Bootstrap after React mount
    try {
      if (typeof initAssessment === 'function') initAssessment();
      if (typeof createParticles === 'function') createParticles();
    } catch (e) {
      console.error(e);
    }
    // Remove the old HTML footer (Platform/Company)
const oldFooter = document.querySelector(
  ".ica3-landing footer.relative.overflow-hidden"
) as HTMLElement | null;

if (oldFooter) oldFooter.remove();

  }, []);

  return (
    <>
      <AppHeader />
      <main className="ica3-landing">
        <style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
.ica3-landing /* ========== RESET & BASE ========== */
        .ica3-landing, .ica3-landing *, .ica3-landing *::before, .ica3-landing *::after { box-sizing: border-box; margin: 0; padding: 0; }.ica3-landing {
            --navy: #264555;
            --gold: #E3BB62;
            --graphite: #1C1C1E;
            --bone: #FAFAF7;
            --blush: #D2C9B9;
            --white: #ffffff;
        }.ica3-landing { scroll-behavior: smooth; }.ica3-landing {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background: var(--graphite);
            color: var(--white);
            line-height: 1.6;
            overflow-x: hidden;
        }.ica3-landing .font-outfit { font-family: 'Outfit', system-ui, -apple-system, sans-serif; }.ica3-landing /* ========== GRADIENT TEXT ========== */
        .gradient-text {
            background: linear-gradient(135deg, #E3BB62 0%, #D2C9B9 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }.ica3-landing /* ========== BACKGROUNDS ========== */
        .bg-gradient-luxury { background: linear-gradient(135deg, #264555 0%, #1C1C1E 100%); }.ica3-landing .bg-gradient-gold { background: linear-gradient(135deg, #E3BB62 0%, #D2C9B9 100%); }.ica3-landing .bg-bone { background: var(--bone); }.ica3-landing .bg-white { background: var(--white); }.ica3-landing .bg-blush-bone { background: linear-gradient(135deg, var(--blush) 0%, var(--bone) 100%); }.ica3-landing .bg-graphite { background: var(--graphite); }.ica3-landing /* ========== GLASS EFFECT ========== */
        .glass-effect {
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }.ica3-landing .glass-effect-light {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }.ica3-landing /* ========== ANIMATIONS ========== */
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }

        @keyframes rotate-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes scale-in {
            0% { opacity: 0; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(0) translateX(-50%); }
            50% { transform: translateY(-10px) translateX(-50%); }
        }

        @keyframes ping {
            75%, 100% { transform: scale(2); opacity: 0; }
        }

        @keyframes float3d {
            0%, 100% { transform: translateY(0px) rotateX(0deg) rotateY(0deg); }
            25% { transform: translateY(-10px) rotateX(5deg) rotateY(5deg); }
            50% { transform: translateY(-20px) rotateX(0deg) rotateY(10deg); }
            75% { transform: translateY(-10px) rotateX(-5deg) rotateY(5deg); }
        }

        @keyframes rotate3d {
            from { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
            to { transform: rotateX(360deg) rotateY(180deg) rotateZ(360deg); }
        }

        @keyframes glow {
            from { box-shadow: 0 0 5px rgba(227, 187, 98, 0.3); }
            to { box-shadow: 0 0 20px rgba(227, 187, 98, 0.6), 0 0 30px rgba(227, 187, 98, 0.4); }
        }

        @keyframes particles {
            0% { background-position: 0% 0%; }
            100% { background-position: 100% 100%; }
        }

        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }

        @keyframes orbit {
            from { transform: rotate(0deg) translateX(60px) rotate(0deg); }
            to { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
        }

        @keyframes dash {
            to { stroke-dashoffset: 0; }
        }

        @keyframes wave {
            0%, 100% { transform: scaleY(0.5); }
            50% { transform: scaleY(1); }
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }.ica3-landing .animate-float { animation: float 6s ease-in-out infinite; }.ica3-landing .animate-rotate-slow { animation: rotate-slow 20s linear infinite; }.ica3-landing .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }.ica3-landing .animate-scale-in { animation: scale-in 0.5s ease-out forwards; }.ica3-landing .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }.ica3-landing .animate-bounce { animation: bounce 1s infinite; }.ica3-landing .animate-ping { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }.ica3-landing .animate-3d-float { animation: float3d 6s ease-in-out infinite; }.ica3-landing .animate-3d-rotate { animation: rotate3d 12s linear infinite; }.ica3-landing .animate-glow { animation: glow 2s ease-in-out infinite alternate; }.ica3-landing .animate-shimmer { animation: shimmer 2s linear infinite; background-size: 200% 100%; }.ica3-landing .animate-orbit { animation: orbit 8s linear infinite; }.ica3-landing .animate-spin { animation: spin 1s linear infinite; }.ica3-landing /* Particle Field Effect */
        .particle-field::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: 
                radial-gradient(2px 2px at 20px 30px, rgba(227, 187, 98, 0.3), transparent),
                radial-gradient(2px 2px at 40px 70px, rgba(38, 69, 85, 0.3), transparent),
                radial-gradient(1px 1px at 90px 40px, rgba(227, 187, 98, 0.2), transparent),
                radial-gradient(1px 1px at 130px 80px, rgba(38, 69, 85, 0.2), transparent);
            background-repeat: repeat;
            background-size: 150px 100px;
            animation: particles 20s linear infinite;
        }.ica3-landing /* ========== MAGNETIC BUTTON ========== */
        .magnetic-button {
            transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
            position: relative;
            overflow: hidden;
        }.ica3-landing .magnetic-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 20px 40px rgba(227, 187, 98, 0.2);
        }.ica3-landing /* ========== CONTAINER ========== */
        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
        }.ica3-landing /* ========== BUTTONS ========== */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 16px 32px;
            font-size: 1.125rem;
            font-weight: 600;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            border: none;
        }.ica3-landing .btn-primary { background: var(--gold); color: var(--graphite); }.ica3-landing .btn-primary:hover { background: rgba(227, 187, 98, 0.9); transform: translateY(-2px); }.ica3-landing .btn-outline {
            background: rgba(255, 255, 255, 0.1);
            color: var(--white);
            border: 1px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
        }.ica3-landing .btn-outline:hover { background: rgba(255, 255, 255, 0.15); border-color: rgba(227, 187, 98, 0.5); }.ica3-landing .btn-lg { padding: 20px 48px; font-size: 1.25rem; border-radius: 16px; }.ica3-landing /* ========== TYPOGRAPHY ========== */
        h1 { font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 700; line-height: 1.1; margin-bottom: 1.5rem; }.ica3-landing h2 { font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; line-height: 1.2; margin-bottom: 1.5rem; }.ica3-landing h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }.ica3-landing h4 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.75rem; }.ica3-landing /* ========== LAYOUT UTILITIES ========== */
        .text-center { text-align: center; }.ica3-landing .flex { display: flex; }.ica3-landing .flex-col { flex-direction: column; }.ica3-landing .flex-wrap { flex-wrap: wrap; }.ica3-landing .items-center { align-items: center; }.ica3-landing .items-start { align-items: flex-start; }.ica3-landing .justify-center { justify-content: center; }.ica3-landing .justify-between { justify-content: space-between; }.ica3-landing .gap-2 { gap: 8px; }.ica3-landing .gap-3 { gap: 12px; }.ica3-landing .gap-4 { gap: 16px; }.ica3-landing .gap-6 { gap: 24px; }.ica3-landing .gap-8 { gap: 32px; }.ica3-landing .space-x-2 > * + * { margin-left: 8px; }.ica3-landing .space-x-4 > * + * { margin-left: 16px; }.ica3-landing .space-x-6 > * + * { margin-left: 24px; }.ica3-landing .space-x-8 > * + * { margin-left: 32px; }.ica3-landing .space-y-2 > * + * { margin-top: 8px; }.ica3-landing .space-y-4 > * + * { margin-top: 16px; }.ica3-landing .space-y-6 > * + * { margin-top: 24px; }.ica3-landing .mb-2 { margin-bottom: 8px; }.ica3-landing .mb-3 { margin-bottom: 12px; }.ica3-landing .mb-4 { margin-bottom: 16px; }.ica3-landing .mb-6 { margin-bottom: 24px; }.ica3-landing .mb-8 { margin-bottom: 32px; }.ica3-landing .mb-12 { margin-bottom: 48px; }.ica3-landing .mb-16 { margin-bottom: 64px; }.ica3-landing .mt-4 { margin-top: 16px; }.ica3-landing .mt-6 { margin-top: 24px; }.ica3-landing .mt-8 { margin-top: 32px; }.ica3-landing .mt-12 { margin-top: 48px; }.ica3-landing .mt-16 { margin-top: 64px; }.ica3-landing .mt-20 { margin-top: 80px; }.ica3-landing .mt-32 { margin-top: 128px; }.ica3-landing .mr-2 { margin-right: 8px; }.ica3-landing .mr-3 { margin-right: 12px; }.ica3-landing .mr-4 { margin-right: 16px; }.ica3-landing .mr-6 { margin-right: 24px; }.ica3-landing .ml-2 { margin-left: 8px; }.ica3-landing .py-16 { padding-top: 64px; padding-bottom: 64px; }.ica3-landing .py-24 { padding-top: 96px; padding-bottom: 96px; }.ica3-landing .px-4 { padding-left: 16px; padding-right: 16px; }.ica3-landing .px-6 { padding-left: 24px; padding-right: 24px; }.ica3-landing .px-8 { padding-left: 32px; padding-right: 32px; }.ica3-landing .px-12 { padding-left: 48px; padding-right: 48px; }.ica3-landing .p-1 { padding: 4px; }.ica3-landing .p-4 { padding: 16px; }.ica3-landing .p-6 { padding: 24px; }.ica3-landing .p-8 { padding: 32px; }.ica3-landing .p-12 { padding: 48px; }.ica3-landing .pt-8 { padding-top: 32px; }.ica3-landing .pb-8 { padding-bottom: 32px; }.ica3-landing .max-w-2xl { max-width: 672px; }.ica3-landing .max-w-3xl { max-width: 768px; }.ica3-landing .max-w-4xl { max-width: 896px; }.ica3-landing .max-w-5xl { max-width: 1024px; }.ica3-landing .max-w-6xl { max-width: 1152px; }.ica3-landing .max-w-7xl { max-width: 1280px; }.ica3-landing .mx-auto { margin-left: auto; margin-right: auto; }.ica3-landing .w-full { width: 100%; }.ica3-landing .h-full { height: 100%; }.ica3-landing .min-h-screen { min-height: 100vh; }.ica3-landing .relative { position: relative; }.ica3-landing .absolute { position: absolute; }.ica3-landing .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }.ica3-landing .z-10 { z-index: 10; }.ica3-landing .overflow-hidden { overflow: hidden; }.ica3-landing .pointer-events-none { pointer-events: none; }.ica3-landing .cursor-pointer { cursor: pointer; }.ica3-landing .opacity-0 { opacity: 0; }.ica3-landing .opacity-5 { opacity: 0.05; }.ica3-landing .opacity-10 { opacity: 0.1; }.ica3-landing .opacity-15 { opacity: 0.15; }.ica3-landing .opacity-20 { opacity: 0.2; }.ica3-landing .opacity-25 { opacity: 0.25; }.ica3-landing .opacity-30 { opacity: 0.3; }.ica3-landing .opacity-40 { opacity: 0.4; }.ica3-landing .opacity-50 { opacity: 0.5; }.ica3-landing .opacity-60 { opacity: 0.6; }.ica3-landing .opacity-70 { opacity: 0.7; }.ica3-landing .opacity-80 { opacity: 0.8; }.ica3-landing /* ========== COLORS ========== */
        .text-white { color: var(--white); }.ica3-landing .text-graphite { color: var(--graphite); }.ica3-landing .text-bone { color: var(--bone); }.ica3-landing .text-muted { color: rgba(255, 255, 255, 0.8); }.ica3-landing .text-subtle { color: rgba(255, 255, 255, 0.6); }.ica3-landing .text-gold { color: var(--gold); }.ica3-landing .text-navy { color: var(--navy); }.ica3-landing .text-sm { font-size: 0.875rem; }.ica3-landing .text-lg { font-size: 1.125rem; }.ica3-landing .text-xl { font-size: 1.25rem; }.ica3-landing .text-2xl { font-size: 1.5rem; }.ica3-landing .text-3xl { font-size: 1.875rem; }.ica3-landing .text-4xl { font-size: 2.25rem; }.ica3-landing .text-5xl { font-size: 3rem; }.ica3-landing .text-6xl { font-size: 3.75rem; }.ica3-landing .font-light { font-weight: 300; }.ica3-landing .font-medium { font-weight: 500; }.ica3-landing .font-semibold { font-weight: 600; }.ica3-landing .font-bold { font-weight: 700; }.ica3-landing .leading-tight { line-height: 1.25; }.ica3-landing .leading-relaxed { line-height: 1.625; }.ica3-landing .italic { font-style: italic; }.ica3-landing .underline { text-decoration: underline; }.ica3-landing /* ========== GRID ========== */
        .grid { display: grid; }.ica3-landing .grid-cols-1 { grid-template-columns: repeat(1, 1fr); }.ica3-landing .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }.ica3-landing .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }

        @media (min-width: 768px) {.ica3-landing .md-grid-cols-2 { grid-template-columns: repeat(2, 1fr); }.ica3-landing .md-grid-cols-3 { grid-template-columns: repeat(3, 1fr); }.ica3-landing .md-grid-cols-4 { grid-template-columns: repeat(4, 1fr); }.ica3-landing .md-grid-cols-6 { grid-template-columns: repeat(6, 1fr); }.ica3-landing .md-flex-row { flex-direction: row; }.ica3-landing .md-text-5xl { font-size: 3rem; }.ica3-landing .md-text-6xl { font-size: 3.75rem; }.ica3-landing .md-text-7xl { font-size: 4.5rem; }.ica3-landing .md-p-12 { padding: 48px; }
        }

        @media (min-width: 1024px) {.ica3-landing .lg-grid-cols-2 { grid-template-columns: repeat(2, 1fr); }.ica3-landing .lg-grid-cols-4 { grid-template-columns: repeat(4, 1fr); }.ica3-landing .lg-grid-cols-6 { grid-template-columns: repeat(6, 1fr); }
        }.ica3-landing /* ========== SECTION STYLES ========== */
        section { position: relative; overflow: hidden; }.ica3-landing .section-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }.ica3-landing /* ========== BORDER RADIUS ========== */
        .rounded { border-radius: 4px; }.ica3-landing .rounded-lg { border-radius: 8px; }.ica3-landing .rounded-xl { border-radius: 12px; }.ica3-landing .rounded-2xl { border-radius: 16px; }.ica3-landing .rounded-3xl { border-radius: 24px; }.ica3-landing .rounded-full { border-radius: 9999px; }.ica3-landing /* ========== BORDERS ========== */
        .border { border-width: 1px; border-style: solid; }.ica3-landing .border-2 { border-width: 2px; border-style: solid; }.ica3-landing .border-4 { border-width: 4px; border-style: solid; }.ica3-landing .border-8 { border-width: 8px; border-style: solid; }.ica3-landing /* ========== TRANSFORMS ========== */
        .rotate-12 { transform: rotate(12deg); }.ica3-landing .rotate-45 { transform: rotate(45deg); }.ica3-landing .-rotate-45 { transform: rotate(-45deg); }.ica3-landing .scale-105 { transform: scale(1.05); }.ica3-landing .scale-110 { transform: scale(1.1); }.ica3-landing .scale-125 { transform: scale(1.25); }.ica3-landing .-translate-x-1\/2 { transform: translateX(-50%); }.ica3-landing .-translate-y-1\/2 { transform: translateY(-50%); }.ica3-landing /* ========== TRANSITIONS ========== */
        .transition-all { transition: all 0.3s ease; }.ica3-landing .transition-transform { transition: transform 0.3s ease; }.ica3-landing .transition-colors { transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease; }.ica3-landing .transition-opacity { transition: opacity 0.3s ease; }.ica3-landing .duration-300 { transition-duration: 300ms; }.ica3-landing .duration-500 { transition-duration: 500ms; }.ica3-landing .duration-700 { transition-duration: 700ms; }.ica3-landing /* ========== SHADOWS ========== */
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }.ica3-landing .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }.ica3-landing .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }.ica3-landing /* ========== BLUR ========== */
        .blur-lg { filter: blur(16px); }.ica3-landing .blur-xl { filter: blur(24px); }.ica3-landing .blur-2xl { filter: blur(40px); }.ica3-landing .blur-3xl { filter: blur(64px); }.ica3-landing /* ========== FLEX SHRINK ========== */
        .flex-shrink-0 { flex-shrink: 0; }.ica3-landing .flex-1 { flex: 1 1 0%; }.ica3-landing /* ========== HERO SECTION ========== */
        .hero-section {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }.ica3-landing .animated-logo {
            width: 64px; height: 64px;
            cursor: pointer;
            transition: all 0.7s ease;
        }.ica3-landing .animated-logo:hover { transform: scale(1.1) rotate(12deg); }.ica3-landing .animated-logo svg { width: 100%; height: 100%; }.ica3-landing .floating-particle {
            position: absolute;
            width: 8px; height: 8px;
            background: linear-gradient(135deg, rgba(227, 187, 98, 0.6), rgba(38, 69, 85, 0.6));
            border-radius: 50%;
        }.ica3-landing .gradient-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(60px);
        }.ica3-landing .scroll-indicator {
            position: absolute;
            bottom: 32px;
            left: 50%;
            transform: translateX(-50%);
            cursor: pointer;
        }.ica3-landing .scroll-mouse {
            width: 24px; height: 40px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 9999px;
            display: flex;
            justify-content: center;
        }.ica3-landing .scroll-dot {
            width: 4px; height: 12px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 9999px;
            margin-top: 8px;
        }.ica3-landing /* ========== FEATURE CARDS ========== */
        .feature-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 32px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            text-align: center;
            transition: all 0.3s ease;
        }.ica3-landing .feature-card:hover { transform: scale(1.05); border-color: rgba(227, 187, 98, 0.3); }.ica3-landing .feature-icon {
            width: 64px; height: 64px;
            margin: 0 auto 24px;
            background: rgba(227, 187, 98, 0.2);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        }.ica3-landing .feature-icon svg { width: 32px; height: 32px; color: var(--gold); }.ica3-landing /* ========== SERVICE CARDS ========== */
        .service-card {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 32px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.5s ease;
        }.ica3-landing .service-card:hover { transform: translateY(-8px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15); }.ica3-landing .service-icon { width: 80px; height: 80px; margin: 0 auto 24px; transition: transform 0.3s ease; }.ica3-landing .service-card:hover .service-icon { transform: scale(1.1); }.ica3-landing .service-icon svg { width: 100%; height: 100%; }.ica3-landing .service-feature {
            display: flex;
            align-items: center;
            font-size: 0.875rem;
            color: rgba(28, 28, 30, 0.6);
            margin-bottom: 8px;
        }.ica3-landing .service-feature-dot {
            width: 6px; height: 6px;
            background: var(--gold);
            border-radius: 50%;
            margin-right: 12px;
        }.ica3-landing .service-bar {
            margin-top: 24px;
            width: 100%;
            height: 4px;
            background: linear-gradient(135deg, var(--gold), var(--blush));
            border-radius: 4px;
            transform: scaleX(0);
            transition: transform 0.5s ease;
        }.ica3-landing .service-card:hover .service-bar { transform: scaleX(1); }.ica3-landing /* ========== PROFESSIONAL CARDS ========== */
        .pro-card {
            background: linear-gradient(135deg, var(--graphite), var(--navy));
            border-radius: 24px;
            padding: 32px;
            color: var(--white);
            position: relative;
            overflow: hidden;
            transition: all 0.5s ease;
        }.ica3-landing .pro-card:hover { transform: scale(1.05); }.ica3-landing .pro-card-bg {
            position: absolute;
            top: 0; right: 0;
            width: 128px; height: 128px;
            opacity: 0.1;
            border-radius: 50%;
            filter: blur(40px);
        }.ica3-landing .pro-icon { width: 64px; height: 64px; margin-bottom: 24px; transition: transform 0.3s ease; }.ica3-landing .pro-card:hover .pro-icon { transform: scale(1.1); }.ica3-landing .pro-icon svg { width: 100%; height: 100%; }.ica3-landing .pro-bar {
            margin-top: 24px;
            height: 4px;
            border-radius: 4px;
            transform: scaleX(0);
            transition: transform 0.5s ease;
        }.ica3-landing .pro-card:hover .pro-bar { transform: scaleX(1); }.ica3-landing /* ========== SMART LOGIC SECTION ========== */
        .smart-feature-card {
            background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(227, 187, 98, 0.05));
            backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 32px;
            border: 1px solid rgba(227, 187, 98, 0.2);
            transition: all 0.5s ease;
        }.ica3-landing .smart-feature-card:hover { transform: scale(1.05); border-color: rgba(227, 187, 98, 0.4); }.ica3-landing .smart-icon {
            width: 80px; height: 80px;
            background: rgba(227, 187, 98, 0.2);
            border-radius: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            transition: transform 0.5s ease;
        }.ica3-landing .smart-feature-card:hover .smart-icon { transform: rotate(12deg); }.ica3-landing .smart-icon svg { width: 40px; height: 40px; color: var(--gold); }.ica3-landing .assessment-node {
            width: 96px; height: 96px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.5s ease;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }.ica3-landing .assessment-node:hover { transform: scale(1.1) rotate(3deg); }.ica3-landing .assessment-node svg { width: 48px; height: 48px; color: var(--white); }.ica3-landing /* ========== DATA VIZ SECTION ========== */
        .data-feature {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 24px;
        }.ica3-landing .data-icon {
            width: 48px; height: 48px;
            background: rgba(227, 187, 98, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }.ica3-landing .data-icon svg { width: 24px; height: 24px; color: var(--gold); }.ica3-landing .dashboard-preview {
            background: rgba(38, 69, 85, 0.4);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 32px;
            border: 1px solid rgba(227, 187, 98, 0.2);
        }.ica3-landing /* ========== CTA SECTION ========== */
        .trust-badge {
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 32px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.7s ease;
        }.ica3-landing .trust-badge:hover { transform: scale(1.05); }.ica3-landing /* ========== FOOTER ========== */
        footer a {
            position: relative;
            text-decoration: none;
        }.ica3-landing footer a:hover { color: var(--gold); }.ica3-landing footer a span.underline-effect {
            position: absolute;
            bottom: 0; left: 0;
            width: 0; height: 2px;
            background: var(--gold);
            transition: width 0.3s ease;
        }.ica3-landing footer a:hover span.underline-effect { width: 100%; }.ica3-landing /* ========== MODAL ========== */
        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }.ica3-landing .modal-overlay.active { display: flex; }.ica3-landing .modal-content {
            background: linear-gradient(135deg, var(--graphite), var(--navy), var(--graphite));
            border: 1px solid rgba(227, 187, 98, 0.2);
            border-radius: 24px;
            padding: 32px;
            max-width: 420px;
            width: 90%;
            position: relative;
            overflow: hidden;
        }.ica3-landing .modal-close {
            position: absolute;
            top: 16px; right: 16px;
            width: 32px; height: 32px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 50%;
            color: white;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }.ica3-landing .modal-close:hover { background: rgba(227, 187, 98, 0.3); }.ica3-landing .form-input {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: white;
            font-size: 1rem;
            margin-top: 4px;
            transition: all 0.3s ease;
        }.ica3-landing .form-input::placeholder { color: rgba(255, 255, 255, 0.5); }.ica3-landing .form-input:focus {
            outline: none;
            border-color: var(--gold);
            box-shadow: 0 0 0 3px rgba(227, 187, 98, 0.2);
        }.ica3-landing .form-label {
            display: block;
            font-size: 0.875rem;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 4px;
        }.ica3-landing .toggle-btn {
            flex: 1;
            padding: 12px 16px;
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.3s ease;
        }.ica3-landing .toggle-btn.active {
            background: var(--gold);
            color: var(--graphite);
            box-shadow: 0 4px 12px rgba(227, 187, 98, 0.3);
        }.ica3-landing .toggle-btn:hover:not(.active) {
            color: white;
            background: rgba(255, 255, 255, 0.05);
        }.ica3-landing /* ========== ASSESSMENT SECTION ========== */
        .assessment-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 24px;
            padding: 32px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        @media (min-width: 768px) {.ica3-landing .assessment-container { padding: 48px; }
        }.ica3-landing .progress-bar {
            width: 100%;
            height: 12px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            overflow: hidden;
        }.ica3-landing .progress-fill {
            height: 100%;
            background: linear-gradient(135deg, #E3BB62 0%, #D2C9B9 100%);
            border-radius: 6px;
            transition: width 0.5s ease;
            position: relative;
        }.ica3-landing .progress-fill::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: shimmer 2s linear infinite;
        }.ica3-landing .question-icon {
            width: 80px; height: 80px;
            background: rgba(227, 187, 98, 0.2);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 24px;
        }.ica3-landing .question-icon svg { width: 32px; height: 32px; color: var(--gold); }.ica3-landing .slider-container {
            padding: 0 16px;
        }.ica3-landing .slider-track {
            width: 100%;
            height: 8px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            position: relative;
            cursor: pointer;
        }.ica3-landing .slider-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--gold), var(--blush));
            border-radius: 4px;
            transition: width 0.1s ease;
        }.ica3-landing .slider-thumb {
            width: 24px; height: 24px;
            background: var(--gold);
            border-radius: 50%;
            position: absolute;
            top: 50%;
            transform: translate(-50%, -50%);
            cursor: grab;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            transition: transform 0.2s ease;
        }.ica3-landing .slider-thumb:hover { transform: translate(-50%, -50%) scale(1.2); }.ica3-landing .slider-thumb:active { cursor: grabbing; }.ica3-landing .option-btn {
            width: 100%;
            padding: 24px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            color: white;
            text-align: left;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
        }.ica3-landing .option-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(227, 187, 98, 0.5);
        }.ica3-landing .option-btn.selected {
            background: rgba(227, 187, 98, 0.2);
            border-color: rgba(227, 187, 98, 0.5);
        }.ica3-landing .option-radio {
            width: 16px; height: 16px;
            border: 2px solid var(--gold);
            border-radius: 50%;
            margin-right: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }.ica3-landing .option-radio.selected {
            background: var(--gold);
        }.ica3-landing .option-radio.selected::after {
            content: '';
            width: 8px; height: 8px;
            background: var(--navy);
            border-radius: 50%;
        }.ica3-landing .yesno-btn {
            padding: 32px;
            border-radius: 12px;
            border: 1px solid;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
        }.ica3-landing .yesno-btn.yes {
            background: rgba(34, 197, 94, 0.2);
            border-color: rgba(34, 197, 94, 0.3);
        }.ica3-landing .yesno-btn.yes:hover, .ica3-landing .yesno-btn.yes.selected {
            background: rgba(34, 197, 94, 0.3);
            border-color: rgba(34, 197, 94, 0.5);
        }.ica3-landing .yesno-btn.no {
            background: rgba(239, 68, 68, 0.2);
            border-color: rgba(239, 68, 68, 0.3);
        }.ica3-landing .yesno-btn.no:hover, .ica3-landing .yesno-btn.no.selected {
            background: rgba(239, 68, 68, 0.3);
            border-color: rgba(239, 68, 68, 0.5);
        }.ica3-landing .text-input {
            width: 100%;
            min-height: 120px;
            padding: 16px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            color: white;
            font-size: 1rem;
            resize: vertical;
            font-family: inherit;
        }.ica3-landing .text-input::placeholder { color: rgba(255, 255, 255, 0.5); }.ica3-landing .text-input:focus {
            outline: none;
            border-color: rgba(227, 187, 98, 0.5);
            box-shadow: 0 0 0 3px rgba(227, 187, 98, 0.1);
        }.ica3-landing .nav-btn {
            display: inline-flex;
            align-items: center;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
        }.ica3-landing .nav-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }.ica3-landing .nav-btn.prev {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }.ica3-landing .nav-btn.prev:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(227, 187, 98, 0.5);
        }.ica3-landing .nav-btn.next, .ica3-landing .nav-btn.submit {
            background: var(--gold);
            color: var(--graphite);
        }.ica3-landing .nav-btn.next:hover:not(:disabled), .ica3-landing .nav-btn.submit:hover:not(:disabled) {
            background: rgba(227, 187, 98, 0.9);
            transform: translateY(-2px);
        }.ica3-landing .step-dot {
            width: 12px; height: 12px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
        }.ica3-landing .step-dot.active {
            background: var(--gold);
            transform: scale(1.25);
        }.ica3-landing .step-dot.completed { background: rgba(227, 187, 98, 0.6); }.ica3-landing .result-circle {
            width: 160px; height: 160px;
            border-radius: 50%;
            border: 8px solid rgba(255, 255, 255, 0.2);
            position: relative;
            margin: 0 auto 24px;
        }.ica3-landing .result-inner {
            position: absolute;
            inset: 8px;
            background: rgba(28, 28, 30, 0.8);
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }.ica3-landing /* ========== HIDDEN UTILITY ========== */
        .hidden { display: none !important; }.ica3-landing /* ========== SVG ICON STYLES ========== */
        .icon { display: inline-block; vertical-align: middle; }.ica3-landing .icon-sm { width: 20px; height: 20px; }.ica3-landing .icon-md { width: 24px; height: 24px; }.ica3-landing .icon-lg { width: 32px; height: 32px; }.ica3-landing .icon-xl { width: 48px; height: 48px; }
        `}</style>
        <div dangerouslySetInnerHTML={{ __html: html }} />
        <footer
  id="cap-footer"
  style={{ ["--cap-pattern" as any]: `url(${patternUrl})` }}
  className="
    relative text-white bg-[#264555]
    [background-image:var(--cap-pattern)]
    bg-repeat bg-left-top [background-size:170px]
    py-16 pb-8 border-t border-white/15
  "
>
  <div className="mx-auto w-full max-w-[1200px] px-6">
    <div className="pb-6 text-center">
      <h4 className="text-2xl font-semibold">cap consulting GmbH</h4>
    </div>

    <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
      <div className="text-center md:text-left">
        <p className="leading-relaxed">
          Potsdamer Str. 150
          <br />
          33719 Bielefeld
        </p>

        <p className="mt-3">
          <a href="tel:+4952199988300" className="underline-offset-2 hover:underline">
            Tel.: +49 521 999 883 00
          </a>
        </p>

        <p className="mt-1">
          <a href="mailto:kontakt@cap-consulting.de" className="underline-offset-2 hover:underline">
            kontakt@cap-consulting.de
          </a>
        </p>
      </div>

      <div className="text-center md:text-right">
        <p className="font-semibold">Up-to-date mit unserem IT-Newsletter</p>
        <a
          href="https://www.cap-consulting.de/newsletter-anmeldung/"
          className="mt-2 inline-flex items-center rounded-md bg-[#E3BB62] px-5 py-2 font-medium text-[#264555] shadow hover:brightness-95"
        >
          Ich möchte aktuell bleiben
        </a>
      </div>
    </div>

    <div className="mt-10 border-white/20 pt-4">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 text-center text-white/90 lg:flex-row lg:justify-evenly">
        <p className="m-0">©2022 cap consulting GmbH</p>
        <a className="hover:underline underline-offset-2" href="https://www.cap-consulting.de/impressum/">
          Impressum
        </a>
        <a className="hover:underline underline-offset-2" href="https://www.cap-consulting.de/datenschutzerklaerung/">
          Datenschutz
        </a>
        <a className="hover:underline underline-offset-2" href="https://www.cap-consulting.de/haftungsausschluss/">
          Haftungsausschluss
        </a>
      </div>
    </div>
  </div>
</footer>

      </main>
    </>
  );
}
