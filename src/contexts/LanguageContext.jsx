import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// ── Translations ─────────────────────────────────────────────────────────────
export const TRANSLATIONS = {
  en: {
    // Sidebar nav
    nav_dashboard: 'Dashboard',
    nav_courses: 'Courses',
    nav_my_courses: 'My Courses',
    nav_labs: 'Labs',
    nav_leaderboard: 'Leaderboard',
    nav_profile: 'Profile',
    nav_users: 'Users',
    nav_students: 'Students',
    nav_analytics: 'Analytics',
    nav_subscriptions: 'Subscriptions',
    nav_course_builder: 'Course Builder',
    nav_sign_out: 'Sign Out',
    nav_admin_panel: 'Admin Panel',

    // TopBar & common
    search_placeholder: 'Search courses, labs...',
    preview_admin: '👤 My View (Admin)',
    preview_master: '📋 Preview as Master',
    preview_participant: '🎓 Preview as Participant',

    // Course page
    enroll_now: 'Enroll Now — Free',
    enrolled: 'Enrolled',
    back_to_courses: 'Back to Courses',
    course_content: 'Course Content',
    lessons: 'lessons',
    enrolled_count: 'enrolled',
    completed: 'completed',
    learning_path: 'Learning Path',
    up_next: '▶ UP NEXT',
    done: '✓ DONE',
    get_certificate: '🎓 Get Certificate',
    course_complete_title: '🏅 Course Complete!',
    course_complete_body: "You've finished all lessons in this course. Outstanding work!",

    // Lesson page
    back_to_course: 'Back to Course',
    complete_lesson: 'Complete Lesson',
    already_completed: 'Completed',
    next: 'Next',
    previous: 'Previous',
    processing: 'Processing...',
    what_youll_learn: "What you'll explore in this lesson",
    how_was_lesson: 'How was this lesson?',
    thanks_feedback: '✅ Thanks for your feedback!',
    lesson_label: 'Lesson',
    of: 'of',
    watch_on: 'Watch on',

    // Labs
    run_code: 'Run Code',
    submit_task: 'Submit Task',
    reset: 'Reset',
    terminal: 'Terminal',
    ai_hints: 'AI Hints',
    reveal_hint: 'Reveal Hint',
    all_hints_revealed: "All hints revealed. You've got this! 💪",
    mission_accomplished: 'Mission Accomplished! 🏅',
    return_to_hub: 'Return to Hub',
    ai_feedback: 'AI Reviewer Feedback',
    running: 'Running…',

    // Onboarding
    onboard_title_1: 'Welcome to VibeLearn!',
    onboard_sub_1: 'Your AI Coding Academy',
    onboard_title_2: 'How It Works',
    onboard_sub_2: 'Learn in 4 simple steps',
    onboard_title_3: 'XP & Levels Explained',
    onboard_sub_3: 'Your progress, gamified',
    onboard_title_4: "You're All Set!",
    onboard_sub_4: 'Time to start your first lesson',
    onboard_start: '🚀 Start Learning!',
    onboard_next: 'Next',
    onboard_back: '← Back',

    // Notifications
    notif_title: 'Notifications',
    notif_subtitle: 'Recent activity',
    notif_empty: 'No recent activity yet. Start a lesson!',
    notif_footer: 'Only lesson completions are shown',
    notif_completed: 'Completed',

    // Guided tour
    tour_dont_show: "Don't show again",
    tour_done: '✓ Done',
    tour_next: 'Next',

    // Page titles
    page_dashboard: 'Dashboard',
    page_dashboard_sub: 'Welcome back! Keep learning.',
    page_courses: 'Courses',
    page_courses_sub: 'Browse and continue your learning journey',
    page_labs: 'Labs',
    page_labs_sub: 'Hands-on simulations and challenges',
    page_leaderboard: 'Leaderboard',
    page_leaderboard_sub: 'Top vibe coders this month',
    page_profile: 'My Profile',
    page_profile_sub: 'Your learning stats and achievements',
    page_users: 'User Management',
    page_users_sub: 'Manage platform members',
    page_builder: 'Course Builder',
    page_builder_sub: 'Create and manage course content',
    page_analytics: 'Analytics',
    page_analytics_sub: 'Platform usage and insights',
    page_subs: 'Subscriptions',
    page_subs_sub: 'Manage SaaS plans and billing',

    // XP
    xp_level: 'Level',
    xp_to_next: 'to next',
  },

  id: {
    // Sidebar nav
    nav_dashboard: 'Dasbor',
    nav_courses: 'Kursus',
    nav_my_courses: 'Kursus Saya',
    nav_labs: 'Laboratorium',
    nav_leaderboard: 'Papan Peringkat',
    nav_profile: 'Profil',
    nav_users: 'Pengguna',
    nav_students: 'Peserta Didik',
    nav_analytics: 'Analitik',
    nav_subscriptions: 'Langganan',
    nav_course_builder: 'Pembuat Kursus',
    nav_sign_out: 'Keluar',
    nav_admin_panel: 'Panel Admin',

    // TopBar & common
    search_placeholder: 'Cari kursus, lab...',
    preview_admin: '👤 Tampilan Saya (Admin)',
    preview_master: '📋 Pratinjau sebagai Master',
    preview_participant: '🎓 Pratinjau sebagai Peserta',

    // Course page
    enroll_now: 'Daftar Sekarang — Gratis',
    enrolled: 'Sudah Terdaftar',
    back_to_courses: 'Kembali ke Kursus',
    course_content: 'Konten Kursus',
    lessons: 'pelajaran',
    enrolled_count: 'terdaftar',
    completed: 'selesai',
    learning_path: 'Jalur Belajar',
    up_next: '▶ SELANJUTNYA',
    done: '✓ SELESAI',
    get_certificate: '🎓 Dapatkan Sertifikat',
    course_complete_title: '🏅 Kursus Selesai!',
    course_complete_body: 'Anda telah menyelesaikan semua pelajaran dalam kursus ini. Luar biasa!',

    // Lesson page
    back_to_course: 'Kembali ke Kursus',
    complete_lesson: 'Selesaikan Pelajaran',
    already_completed: 'Sudah Selesai',
    next: 'Selanjutnya',
    previous: 'Sebelumnya',
    processing: 'Memproses...',
    what_youll_learn: 'Yang akan kamu pelajari dalam pelajaran ini',
    how_was_lesson: 'Bagaimana pelajaran ini?',
    thanks_feedback: '✅ Terima kasih atas masukanmu!',
    lesson_label: 'Pelajaran',
    of: 'dari',
    watch_on: 'Tonton di',

    // Labs
    run_code: 'Jalankan Kode',
    submit_task: 'Kirim Tugas',
    reset: 'Reset',
    terminal: 'Terminal',
    ai_hints: 'Petunjuk AI',
    reveal_hint: 'Tampilkan Petunjuk',
    all_hints_revealed: 'Semua petunjuk ditampilkan. Kamu pasti bisa! 💪',
    mission_accomplished: 'Misi Berhasil! 🏅',
    return_to_hub: 'Kembali ke Hub',
    ai_feedback: 'Umpan Balik AI Reviewer',
    running: 'Menjalankan…',

    // Onboarding
    onboard_title_1: 'Selamat datang di VibeLearn!',
    onboard_sub_1: 'Akademi Coding AI-mu',
    onboard_title_2: 'Cara Kerja',
    onboard_sub_2: 'Belajar dalam 4 langkah mudah',
    onboard_title_3: 'XP & Level Dijelaskan',
    onboard_sub_3: 'Progresmu, dalam bentuk permainan',
    onboard_title_4: 'Kamu Siap!',
    onboard_sub_4: 'Waktunya memulai pelajaran pertamamu',
    onboard_start: '🚀 Mulai Belajar!',
    onboard_next: 'Lanjut',
    onboard_back: '← Kembali',

    // Notifications
    notif_title: 'Notifikasi',
    notif_subtitle: 'Aktivitas terbaru',
    notif_empty: 'Belum ada aktivitas. Mulai pelajaran!',
    notif_footer: 'Hanya penyelesaian pelajaran yang ditampilkan',
    notif_completed: 'Selesai',

    // Guided tour
    tour_dont_show: 'Jangan tampilkan lagi',
    tour_done: '✓ Selesai',
    tour_next: 'Lanjut',

    // Page titles
    page_dashboard: 'Dasbor',
    page_dashboard_sub: 'Selamat datang kembali! Terus belajar.',
    page_courses: 'Kursus',
    page_courses_sub: 'Jelajahi dan lanjutkan perjalanan belajarmu',
    page_labs: 'Laboratorium',
    page_labs_sub: 'Simulasi dan tantangan berbasis praktik',
    page_leaderboard: 'Papan Peringkat',
    page_leaderboard_sub: 'Vibe coder terbaik bulan ini',
    page_profile: 'Profil Saya',
    page_profile_sub: 'Statistik belajar dan pencapaianmu',
    page_users: 'Manajemen Pengguna',
    page_users_sub: 'Kelola anggota platform',
    page_builder: 'Pembuat Kursus',
    page_builder_sub: 'Buat dan kelola konten kursus',
    page_analytics: 'Analitik',
    page_analytics_sub: 'Penggunaan platform dan wawasan',
    page_subs: 'Langganan',
    page_subs_sub: 'Kelola paket SaaS dan penagihan',

    // XP
    xp_level: 'Level',
    xp_to_next: 'ke berikutnya',
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('vl_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('vl_lang', lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;

  const toggleLang = () => setLang(l => l === 'en' ? 'id' : 'en');

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
