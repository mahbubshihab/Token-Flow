"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  CheckCircle2, 
  RefreshCw, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Code2, 
  Zap, 
  Search, 
  Sliders, 
  Play, 
  FileSpreadsheet,
  Upload,
  UserX,
  Lock,
  KeyRound,
  FileDown,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  X,
  Square,
  LogOut,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import * as XLSX from "xlsx";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

type AccountStatus = "idle" | "processing" | "LIVE" | "SUSPENDED" | "ERROR" | "NOT_EXIST";

interface MailMessageItem {
  uid?: number;
  from?: string;
  subject?: string;
  code?: string;
  date?: string;
  message?: string;
}

interface AccountItem {
  id: string;
  email: string;
  pass: string;
  refresh_token: string;
  client_id: string;
  status: AccountStatus;
  sender?: string;
  time?: string;
  rawResponseContent?: string;
  messagesList?: MailMessageItem[];
  otpCode?: string;
  statusMessage?: string;
  rawResponse?: any;
}

interface CustomAlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type: "warning" | "error" | "info";
}

// Authorized Email Whitelist
const ALLOWED_EMAILS = [
  "mksojibedu@gmail.com",
  "xlshihab9@gmail.com"
];

// Interactive 60FPS Full-Screen Canvas Laser Matrix Particle Animation
function CyberMatrixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Dynamic glowing cyber particle nodes
    const particleCount = Math.min(110, Math.floor(window.innerWidth / 12));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.6,
      vy: (Math.random() - 0.5) * 1.6,
      radius: Math.random() * 2.5 + 1.2,
      color: ["#818CF8", "#38BDF8", "#34D399", "#C084FC", "#F472B6"][Math.floor(Math.random() * 5)],
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw glowing connecting laser lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 160) {
            const alpha = (1 - dist / 160) * 0.45;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      // Move and render particles with glowing shadow
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

export default function Home() {
  // Auth States
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  // Application States
  const [inputText, setInputText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "LIVE" | "SUSPENDED" | "ERROR" | "NOT_EXIST" | "HAS_OTP">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedRawItem, setSelectedRawItem] = useState<AccountItem | null>(null);
  const [concurrency, setConcurrency] = useState<number>(25); // Default 25 parallel threads (Ultra Speed)
  const [expandedAccountIds, setExpandedAccountIds] = useState<Record<string, boolean>>({});
  const shouldStopRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Custom UI Alert Modal State
  const [customAlert, setCustomAlert] = useState<CustomAlertState>({
    isOpen: false,
    title: "",
    message: "",
    type: "warning",
  });

  const showAlert = (message: string, title = "Notification", type: "warning" | "error" | "info" = "warning") => {
    setCustomAlert({
      isOpen: true,
      title,
      message,
      type,
    });
  };

  const closeAlert = () => {
    setCustomAlert((prev) => ({ ...prev, isOpen: false }));
  };

  // Firebase Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const userEmail = currentUser.email?.toLowerCase().trim();
        if (userEmail && ALLOWED_EMAILS.includes(userEmail)) {
          setUser(currentUser);
        } else {
          signOut(auth);
          setUser(null);
          showAlert(
            "Access Denied. Your Google account is not authorized to use TokenFlow Mail Checker.",
            "Unauthorized Account",
            "error"
          );
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign In Handler
  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user.email?.toLowerCase().trim();
      
      if (!userEmail || !ALLOWED_EMAILS.includes(userEmail)) {
        await signOut(auth);
        setUser(null);
        showAlert(
          "Access Denied. Your Google account is not authorized to use TokenFlow Mail Checker.",
          "Unauthorized Account",
          "error"
        );
      }
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        showAlert(err.message || "Failed to sign in with Google.", "Authentication Error", "error");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err: any) {
      showAlert("Error signing out.", "Error", "error");
    }
  };

  const stopProcessing = () => {
    shouldStopRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsProcessing(false);
  };

  // Toggle single account expand/collapse for viewing all inbox messages
  const toggleExpand = (id: string) => {
    setExpandedAccountIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Handle Excel File Upload (Column D Auto Parsing - Supports 10,000+ Rows)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const colDLines: string[] = [];
        for (let i = 0; i < data.length; i++) {
          const cellVal = data[i][3]; // Column D
          if (cellVal && typeof cellVal === "string" && cellVal.includes("|")) {
            colDLines.push(cellVal.trim());
          }
        }

        if (colDLines.length > 0) {
          setInputText(colDLines.join("\n"));
        } else {
          showAlert("No pipe-separated account lines found in Column D.", "File Parsing Error", "warning");
        }
      } catch (err: any) {
        showAlert("Error parsing Excel file: " + err.message, "File Error", "error");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Parse input textarea lines into structured accounts
  const parseInputLines = (): AccountItem[] => {
    if (!inputText.trim()) return [];
    const lines = inputText.split("\n");
    const result: AccountItem[] = [];
    const now = Date.now();

    for (let idx = 0; idx < lines.length; idx++) {
      const trimmed = lines[idx].trim();
      if (!trimmed) continue;
      const parts = trimmed.split("|");
      result.push({
        id: `acc-${idx}-${now}`,
        email: parts[0]?.trim() || `unknown-${idx}`,
        pass: parts[1]?.trim() || "",
        refresh_token: parts[2]?.trim() || "",
        client_id: parts[3]?.trim() || "",
        status: "idle",
      });
    }

    return result;
  };

  // Extract OTP Code from content text using regex
  const extractOtpCode = (text: string): string | undefined => {
    if (!text) return undefined;
    const codeMatch = text.match(/\b\d{4,8}\b/);
    return codeMatch ? codeMatch[0] : undefined;
  };

  // Comprehensive Multi-lingual Amazon Suspension Checker
  const isSuspendedMessage = (strText: string, fromEmail = ""): boolean => {
    if (!strText && !fromEmail) return false;
    const text = strText.toLowerCase();
    const from = fromEmail.toLowerCase();

    // Specific Amazon Suspension Senders
    if (
      from.includes("appeal@amazon") ||
      from.includes("seller-appeal") ||
      from.includes("merchant-approval") ||
      from.includes("account-appeal")
    ) {
      return true;
    }

    // English
    if (
      text.includes("account is suspended") ||
      text.includes("account has been suspended") ||
      text.includes("account is on hold") ||
      text.includes("temporarily on hold") ||
      text.includes("account has been locked") ||
      text.includes("action required: your amazon account")
    ) {
      return true;
    }

    // Spanish
    if (
      text.includes("retenida temporalmente") ||
      text.includes("cuenta suspendida") ||
      text.includes("su cuenta de amazon está retenida") ||
      text.includes("cuenta ha sido suspendida") ||
      text.includes("retendida")
    ) {
      return true;
    }

    // Vietnamese
    if (
      text.includes("bị tạm khóa") ||
      text.includes("bị đình chỉ") ||
      text.includes("tài khoản amazon của bạn bị")
    ) {
      return true;
    }

    // German
    if (
      text.includes("vorübergehend gesperrt") ||
      text.includes("konto wurde gesperrt") ||
      text.includes("konto ist gesperrt")
    ) {
      return true;
    }

    // French
    if (
      text.includes("est temporairement suspendu") ||
      text.includes("compte a été suspendu") ||
      text.includes("votre compte amazon est")
    ) {
      return true;
    }

    // Italian
    if (
      text.includes("temporaneamente sospeso") ||
      text.includes("account è stato sospeso")
    ) {
      return true;
    }

    // Portuguese
    if (
      text.includes("temporariamente suspensa") ||
      text.includes("sua conta da amazon foi suspensa")
    ) {
      return true;
    }

    return false;
  };

  // Categorize Dongvanfb API Response into 4 main statuses
  const categorizeResponse = (resData: any): { status: AccountStatus; message: string } => {
    if (!resData) {
      return { status: "ERROR", message: "Lỗi kết nối!" };
    }

    // Explicit Status Check from Dongvanfb API
    if (resData.status === true || Array.isArray(resData.messages) || resData.code) {
      return { status: "LIVE", message: resData.content || "Account Live & Inbox Active" };
    }

    const errStr = (resData.content || resData.error || resData.message || JSON.stringify(resData)).toLowerCase();

    // Check specific error messages
    if (
      errStr.includes("lỗi kết nối") ||
      errStr.includes("proxy connection error") ||
      errStr.includes("timeout") ||
      errStr.includes("err_failed") ||
      errStr.includes("server error")
    ) {
      return { status: "ERROR", message: resData.content || resData.error || "Lỗi kết nối!" };
    }

    return { status: "NOT_EXIST", message: resData.content || resData.error || "Account Not Exist / Login Fail" };
  };

  // Check single account against API
  const checkSingleAccount = async (account: AccountItem, signal?: AbortSignal): Promise<AccountItem> => {
    try {
      const proxyUrl = process.env.NEXT_PUBLIC_PROXY_URL || "https://token-flow-proxy.vercel.app/api/get_messages_oauth2";
      let res: Response;
      try {
        res = await fetch(proxyUrl, {
          method: "POST",
          headers: { 
            "accept": "*/*",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            email: account.email,
            pass: account.pass,
            refresh_token: account.refresh_token,
            client_id: account.client_id,
          }),
          signal,
        });
      } catch (e: any) {
        if (e.name === 'AbortError') throw e;
        res = await fetch("https://tools.dongvanfb.net/api/get_messages_oauth2", {
          method: "POST",
          headers: { 
            "accept": "*/*",
            "content-type": "application/json",
            "Referer": "https://dongvanfb.net/"
          },
          body: JSON.stringify({
            email: account.email,
            pass: account.pass,
            refresh_token: account.refresh_token,
            client_id: account.client_id,
          }),
          signal,
        });
      }

      const mailData = await res.json();

      // Extract messages array & preserve exact raw API response text content
      const messagesList: MailMessageItem[] = Array.isArray(mailData?.messages)
        ? mailData.messages
        : Array.isArray(mailData)
        ? mailData
        : [];

      let topOtpCode = mailData?.code;
      if (!topOtpCode && messagesList.length > 0) {
        for (const msg of messagesList) {
          if (msg.code) {
            topOtpCode = msg.code;
            break;
          }
          const found = extractOtpCode(msg.subject || msg.message || "");
          if (found) {
            topOtpCode = found;
            break;
          }
        }
      }

      // Preserve EXACT raw content string from API response
      const exactApiContent =
        mailData?.content ||
        mailData?.error ||
        mailData?.message ||
        (messagesList.length > 0 ? messagesList[0].subject : undefined) ||
        JSON.stringify(mailData);

      // Check if IMAP connection succeeded (status: true OR messages list present OR code present)
      const isSuccessResponse = mailData?.status === true || messagesList.length > 0 || Boolean(mailData?.code);

      if (isSuccessResponse) {
        // Check if ANY inbox message or content indicates account suspension/hold
        let hasSuspension = isSuspendedMessage(mailData?.content || "");
        if (!hasSuspension && messagesList.length > 0) {
          for (const msg of messagesList) {
            if (isSuspendedMessage((msg.subject || "") + " " + (msg.message || ""), msg.from || "")) {
              hasSuspension = true;
              break;
            }
          }
        }

        if (hasSuspension) {
          return {
            ...account,
            status: "SUSPENDED",
            statusMessage: "Amazon Account Suspended",
            rawResponseContent: exactApiContent,
            messagesList,
            otpCode: topOtpCode,
            rawResponse: mailData,
          };
        }

        return {
          ...account,
          status: "LIVE",
          statusMessage: "Account Live",
          rawResponseContent: exactApiContent,
          messagesList,
          otpCode: topOtpCode,
          rawResponse: mailData,
        };
      }

      // If IMAP connection failed or returned status: false
      const cat = categorizeResponse(mailData);
      return {
        ...account,
        status: cat.status,
        statusMessage: cat.message,
        rawResponseContent: exactApiContent,
        rawResponse: mailData,
      };

    } catch (err: any) {
      if (err.name === 'AbortError') {
        return {
          ...account,
          status: "idle",
          statusMessage: "Stopped",
          rawResponseContent: "Stopped by user",
        };
      }
      return {
        ...account,
        status: "ERROR",
        statusMessage: "Lỗi kết nối!",
        rawResponseContent: err?.message || "Lỗi kết nối!",
      };
    }
  };

  // Start batch checking
  const startProcessing = async () => {
    const parsed = parseInputLines();
    if (parsed.length === 0) {
      showAlert("Please paste account lines or upload an Excel file.", "No Input Data", "warning");
      return;
    }

    shouldStopRef.current = false;
    abortControllerRef.current = new AbortController();
    setAccounts(parsed);
    setIsProcessing(true);

    const updatedAccounts = [...parsed];

    for (let i = 0; i < updatedAccounts.length; i += concurrency) {
      if (shouldStopRef.current) {
        break;
      }

      const batchIndices = Array.from(
        { length: Math.min(concurrency, updatedAccounts.length - i) },
        (_, k) => i + k
      );

      batchIndices.forEach((idx) => {
        updatedAccounts[idx] = { ...updatedAccounts[idx], status: "processing" };
      });
      setAccounts([...updatedAccounts]);

      const results = await Promise.all(
        batchIndices.map((idx) => checkSingleAccount(updatedAccounts[idx], abortControllerRef.current?.signal))
      );

      if (shouldStopRef.current) {
        batchIndices.forEach((idx, k) => {
          if (results[k]) updatedAccounts[idx] = results[k];
        });
        setAccounts([...updatedAccounts]);
        break;
      }

      results.forEach((res, k) => {
        updatedAccounts[batchIndices[k]] = res;
      });
      setAccounts([...updatedAccounts]);
    }

    setIsProcessing(false);
    shouldStopRef.current = false;
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dedicated Excel Download for Specific Category
  const exportCategoryToExcel = (category: AccountStatus | "ALL" | "HAS_OTP") => {
    let exportList = accounts;
    if (category !== "ALL") {
      if (category === "HAS_OTP") {
        exportList = accounts.filter((a) => Boolean(a.otpCode));
      } else {
        exportList = accounts.filter((a) => a.status === category);
      }
    }

    if (exportList.length === 0) {
      showAlert(`No entries found for category: ${category}`, "Export Warning", "info");
      return;
    }

    const excelRows = exportList.map((acc, idx) => ({
      STT: idx + 1,
      Email: acc.email,
      Password: acc.pass,
      Status_Category: acc.status,
      Response_Content: acc.rawResponseContent || acc.statusMessage || "-",
      Total_Inbox_Messages: acc.messagesList ? acc.messagesList.length : 0,
      OTP_Code: acc.otpCode || "-",
      Raw_Account_String: `${acc.email}|${acc.pass}|${acc.refresh_token}|${acc.client_id}`
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${category}_Accounts`);
    XLSX.writeFile(workbook, `TokenFlow_${category}_Results_${Date.now()}.xlsx`);
  };

  // Stats calculation
  const total = accounts.length;
  const processed = accounts.filter((a) => a.status !== "idle" && a.status !== "processing").length;
  const liveCount = accounts.filter((a) => a.status === "LIVE").length;
  const suspendedCount = accounts.filter((a) => a.status === "SUSPENDED").length;
  const errorCount = accounts.filter((a) => a.status === "ERROR").length;
  const notExistCount = accounts.filter((a) => a.status === "NOT_EXIST").length;
  const otpCount = accounts.filter((a) => Boolean(a.otpCode)).length;

  const progressPercent = total > 0 ? Math.round((processed / total) * 100) : 0;

  // Category Download Buttons Configuration (4 Main Categories)
  const categoryDownloadButtons = [
    {
      key: "LIVE" as const,
      label: `Download LIVE Excel (${liveCount})`,
      count: liveCount,
      activeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 shadow-emerald-500/10",
    },
    {
      key: "SUSPENDED" as const,
      label: `Download SUSPENDED Excel (${suspendedCount})`,
      count: suspendedCount,
      activeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20 shadow-purple-500/10",
    },
    {
      key: "ERROR" as const,
      label: `Download ERROR Excel (${errorCount})`,
      count: errorCount,
      activeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20 shadow-rose-500/10",
    },
    {
      key: "NOT_EXIST" as const,
      label: `Download NOT EXIST Excel (${notExistCount})`,
      count: notExistCount,
      activeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 shadow-amber-500/10",
    },
  ];

  // Dynamic sorting from HIGHEST COUNT to LOWEST COUNT
  const sortedCategoryButtons = [...categoryDownloadButtons].sort((a, b) => b.count - a.count);

  // Filter accounts for UI table view
  const filteredAccounts = accounts.filter((acc) => {
    const matchesTab =
      activeTab === "ALL" ||
      (activeTab === "HAS_OTP" && Boolean(acc.otpCode)) ||
      acc.status === activeTab;

    const matchesSearch =
      acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.rawResponseContent && acc.rawResponseContent.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (acc.otpCode && acc.otpCode.includes(searchQuery));

    return matchesTab && matchesSearch;
  });

  // Render Auth Loading Spinner
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-4 p-8 glass-panel rounded-2xl border border-indigo-500/20 shadow-2xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
          </div>
          <span className="text-sm font-medium text-slate-300 tracking-wide font-mono">
            Verifying Authentication...
          </span>
        </div>
      </div>
    );
  }

  // Render Unauthenticated Google Login Screen with High-Level Animated Cyber Particle Matrix
  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4 bg-[#090D16] overflow-hidden cyber-grid">
        {/* Full-Screen 60FPS Interactive Cyber Particle Laser Mesh */}
        <CyberMatrixCanvas />

        {/* Animated Background Plasma Nebulae */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-pink-600/20 blur-3xl animate-blob-1 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-teal-500/25 via-emerald-600/20 to-indigo-600/20 blur-3xl animate-blob-2 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-gradient-to-r from-blue-600/20 via-indigo-600/25 to-purple-600/20 blur-3xl animate-blob-3 pointer-events-none" />

        {/* Central Futuristic Glass Login Card with Thin Edge Rotating Light Beam */}
        <div className="relative z-10 w-full max-w-md p-[1.5px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300">
          {/* Thin Glowing Light Beam Tracing Card Edge */}
          <div className="absolute inset-[-150%] animate-spin-border bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_280deg,#38BDF8_330deg,#818CF8_350deg,#C084FC_360deg)] opacity-90 pointer-events-none" />

          {/* Inner Card Body with High-End Glassmorphism */}
          <div className="relative z-10 rounded-[23px] bg-slate-900/40 backdrop-blur-2xl p-8 sm:p-10 text-center overflow-hidden border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]">
            
            {/* Subtle Frosted Glass Top Reflection Highlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-500" />

            <div className="relative z-10 flex flex-col items-center">
              {/* Cyber Shield Badge with Outer Pulsing Ring */}
              <div className="relative flex items-center justify-center">
                <div className="absolute -inset-2 rounded-3xl bg-indigo-500/20 blur-md cyber-pulse-ring" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 p-0.5 shadow-2xl shadow-indigo-500/40">
                  <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0B101D]/90">
                    <Zap className="h-9 w-9 text-indigo-400 fill-indigo-400/20" />
                  </div>
                </div>
              </div>

              <h1 className="mt-7 text-2xl sm:text-3xl font-extrabold tracking-tight text-white glow-text">
                TokenFlow <span className="text-indigo-400">Mail Checker</span>
              </h1>
              
              <p className="mt-2.5 text-xs leading-relaxed text-slate-300/90 max-w-xs font-sans">
                Sign in with your authorized Google account to access the TokenFlow Mail Checker dashboard.
              </p>

              {/* Dark Cyber Glass Google Sign-In Button */}
              <div className="mt-8 w-full">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="w-full flex items-center justify-center gap-3.5 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/15 hover:border-indigo-400/80 px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-indigo-950/40 hover:shadow-indigo-500/20 hover:bg-slate-900/80 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 cursor-pointer group"
                >
                  {isSigningIn ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
                      <span className="text-slate-200">Verifying Google Account...</span>
                    </>
                  ) : (
                    <>
                      {/* SVG Google Logo */}
                      <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-slate-800/80 p-1 border border-slate-700/80 group-hover:scale-110 transition-transform">
                        <svg className="h-full w-full" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      </div>
                      <span className="tracking-wide text-slate-100 font-medium group-hover:text-indigo-300 transition-colors">
                        Sign in with Google
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Futuristic Security Protection Tag */}
              <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>OAuth2 Encrypted & Access Protected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Credit Floating Badge in Bottom Right Corner */}
        <div className="fixed bottom-4 right-4 z-30 glass-panel rounded-full px-3.5 py-1.5 border border-indigo-500/30 flex items-center gap-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">Created by:</span>
            <a
              href="https://mahbubshihab.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="relative h-7 w-7 rounded-full overflow-hidden border border-indigo-400/50 shadow-md shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                <img
                  src="/developer.png"
                  alt="Mahbub Shihab"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                Mahbub Shihab
              </span>
            </a>
          </div>

          <div className="h-3.5 w-[1px] bg-slate-700/80" />

          {/* WhatsApp Link Icon */}
          <a
            href="https://wa.me/8801521798452"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:scale-110 transition-all cursor-pointer"
            title="Contact on WhatsApp (+8801521798452)"
          >
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </a>
        </div>

        {/* Custom Alert Modal for Unauthenticated View */}
        {customAlert.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-md rounded-2xl p-5 shadow-2xl border border-rose-500/40 bg-[#0E1322]/95">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <ShieldAlert className="h-4 w-4 text-rose-400" />
                  </div>
                  <h3 className="font-bold text-white text-sm tracking-wide">
                    {customAlert.title}
                  </h3>
                </div>
                <button
                  onClick={closeAlert}
                  className="rounded-lg bg-slate-800/80 p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 text-xs leading-relaxed text-slate-300 font-sans">
                {customAlert.message}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeAlert}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Authenticated Main Application
  return (
    <div className="min-h-screen pb-16">
      {/* Clean Modern Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0B0F19]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0B0F19]">
                <Zap className="h-4 w-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white glow-text">
                TokenFlow <span className="text-indigo-400">Mail Checker</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-3 py-1.5 border border-slate-700/60 text-xs font-semibold text-slate-300 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 pt-4 sm:pt-6 sm:px-6">
        {/* Top Control Grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          
          {/* Main Input Panel */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 lg:col-span-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-indigo-400" />
                <h2 className="font-semibold text-white text-sm sm:text-base">Input Account Lines (Column D Format)</h2>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 cursor-pointer rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Excel File</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => setInputText("")}
                  className="flex items-center justify-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </button>
              </div>
            </div>

            {/* Input Textarea */}
            <div className="relative mt-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste account lines or upload an Excel file (Column D format: email|pass|refresh_token|client_id):&#10;IcyDiorio27629@outlook.com|qpxapa87290|M.C515_BL2...|9e5f94bc-e8a4-4e73-b8be-63364c29d753"
                rows={7}
                className="glass-input w-full rounded-xl p-3 sm:p-3.5 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
              />
              <div className="absolute bottom-3 right-3 text-[11px] font-mono text-slate-500">
                {inputText.trim() ? inputText.trim().split("\n").length : 0} entries
              </div>
            </div>

            {/* Process & Stop Action Buttons */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={startProcessing}
                  disabled={isProcessing || !inputText.trim()}
                  className="flex-1 sm:flex-initial group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] hover:shadow-emerald-500/30 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer text-xs sm:text-sm"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Processing ({processed}/{total})...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-white" />
                      <span>Start Batch Check</span>
                    </>
                  )}
                </button>

                {/* Speed Concurrency Selector */}
                <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/80 border border-white/10 px-3 py-2 text-xs text-slate-300 shadow-inner">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[11px] font-mono text-slate-400">Speed:</span>
                  <select
                    value={concurrency}
                    onChange={(e) => setConcurrency(Number(e.target.value))}
                    disabled={isProcessing}
                    className="bg-transparent text-xs font-semibold text-emerald-400 focus:outline-none cursor-pointer"
                  >
                    <option value={10} className="bg-slate-900 text-slate-200">10 Threads (Normal)</option>
                    <option value={25} className="bg-slate-900 text-slate-200">25 Threads (Fast ⚡)</option>
                    <option value={35} className="bg-slate-900 text-slate-200">35 Threads (Ultra 🚀)</option>
                    <option value={50} className="bg-slate-900 text-slate-200">50 Threads (Turbo 🔥)</option>
                  </select>
                </div>

                {isProcessing && (
                  <button
                    onClick={stopProcessing}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-rose-600/30 border border-rose-400/40 transition-all cursor-pointer active:scale-95 animate-pulse"
                    title="Instantly stop checking accounts"
                  >
                    <Square className="h-3.5 w-3.5 fill-white" />
                    <span>Stop Check</span>
                  </button>
                )}
              </div>

              {total > 0 && (
                <button
                  onClick={() => exportCategoryToExcel("ALL")}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-indigo-400" />
                  Download All Results (.xlsx)
                </button>
              )}
            </div>
          </div>

          {/* Categorization Stat Cards */}
          <div className="glass-panel flex flex-col justify-between rounded-2xl p-4 sm:p-5 lg:col-span-4 shadow-xl">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-semibold text-white flex items-center gap-2 text-sm sm:text-base">
                  <Sliders className="h-4 w-4 text-indigo-400" />
                  Live Categorization Stats
                </h3>
                <span className="text-xs font-mono text-indigo-400">{progressPercent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-900 p-0.5 border border-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-teal-300 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Categorization Stat Grid (4 Main Categories) */}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 sm:p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    LIVE
                  </div>
                  <div className="mt-1 font-mono text-lg sm:text-xl font-bold text-emerald-400">{liveCount}</div>
                </div>

                <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-2.5 sm:p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
                    <Lock className="h-3.5 w-3.5" />
                    SUSPENDED
                  </div>
                  <div className="mt-1 font-mono text-lg sm:text-xl font-bold text-purple-400">{suspendedCount}</div>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 sm:p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    ERROR
                  </div>
                  <div className="mt-1 font-mono text-lg sm:text-xl font-bold text-rose-400">{errorCount}</div>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 sm:p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <UserX className="h-3.5 w-3.5" />
                    NOT EXIST
                  </div>
                  <div className="mt-1 font-mono text-lg sm:text-xl font-bold text-amber-400">{notExistCount}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>OTP Codes Extracted:</span>
              <span className="font-mono text-emerald-400 font-bold">{otpCount} Codes</span>
            </div>
          </div>
        </div>

        {/* Dedicated Excel Export Downloads Bar (Dynamically Sorted & Inactive for Count=0) */}
        {accounts.length > 0 && (
          <div className="glass-panel mt-5 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-indigo-500/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 shrink-0">
              <FileDown className="h-4 w-4 text-indigo-400" />
              <span>Download Excel Files by Category:</span>
            </div>

            {/* Dynamically Sorted Category Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {sortedCategoryButtons.map((btn) => {
                const isZero = btn.count === 0;
                return (
                  <button
                    key={btn.key}
                    onClick={() => exportCategoryToExcel(btn.key)}
                    disabled={isZero}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                      isZero
                        ? "opacity-30 cursor-not-allowed pointer-events-none border-slate-800 bg-slate-900/50 text-slate-500"
                        : btn.activeClass
                    }`}
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>{btn.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Expandable Results Table Section */}
        <div className="glass-panel mt-5 sm:mt-6 rounded-2xl p-4 sm:p-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === "ALL"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                }`}
              >
                All ({accounts.length})
              </button>
              <button
                onClick={() => setActiveTab("LIVE")}
                className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === "LIVE"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                    : "bg-slate-900 text-emerald-400 hover:bg-slate-800"
                }`}
              >
                LIVE ({liveCount})
              </button>
              <button
                onClick={() => setActiveTab("SUSPENDED")}
                className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === "SUSPENDED"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                    : "bg-slate-900 text-purple-400 hover:bg-slate-800"
                }`}
              >
                SUSPENDED ({suspendedCount})
              </button>
              <button
                onClick={() => setActiveTab("ERROR")}
                className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === "ERROR"
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-500/30"
                    : "bg-slate-900 text-rose-400 hover:bg-slate-800"
                }`}
              >
                ERROR ({errorCount})
              </button>
              <button
                onClick={() => setActiveTab("NOT_EXIST")}
                className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === "NOT_EXIST"
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-500/30"
                    : "bg-slate-900 text-amber-400 hover:bg-slate-800"
                }`}
              >
                NOT EXIST ({notExistCount})
              </button>
              <button
                onClick={() => setActiveTab("HAS_OTP")}
                className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === "HAS_OTP"
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                    : "bg-slate-900 text-teal-400 hover:bg-slate-800"
                }`}
              >
                OTP Codes ({otpCount})
              </button>
            </div>

            {/* Search filter input */}
            <div className="relative w-full sm:w-auto sm:min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search email, OTP, content..."
                className="w-full rounded-lg border border-slate-800 bg-slate-900/90 pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Results Table with Horizontal Scroll for Mobile */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
              <thead className="bg-slate-900/80 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-3 py-3 text-center">STT</th>
                  <th className="px-4 py-3">Mail / Account</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-6 py-3">Response Content</th>
                  <th className="px-4 py-3 text-center">Code (OTP)</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                      {accounts.length === 0
                        ? "Upload Excel file or paste entries above and click 'Start Batch Check' to process."
                        : "No matching accounts found for current status filter."}
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((acc, idx) => {
                    const isExpanded = Boolean(expandedAccountIds[acc.id]);
                    const hasMultipleMessages = Boolean(acc.messagesList && acc.messagesList.length > 1);
                    const firstMsg = acc.messagesList && acc.messagesList.length > 0 ? acc.messagesList[0] : null;

                    return (
                      <React.Fragment key={acc.id}>
                        {/* Main Account Summary Row */}
                        <tr className="group transition-colors hover:bg-slate-800/40">
                          {/* STT + Expand Button */}
                          <td className="px-3 py-3.5 font-mono text-slate-400 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {hasMultipleMessages ? (
                                <button
                                  onClick={() => toggleExpand(acc.id)}
                                  className="rounded p-0.5 hover:bg-slate-700 text-indigo-400 transition-colors"
                                  title="Expand all inbox messages"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                              ) : null}
                              <span>{idx + 1}</span>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-4 py-3.5 font-medium text-white max-w-[200px] truncate">
                            <div className="flex items-center gap-2">
                              {acc.status === "processing" && (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400 shrink-0" />
                              )}
                              <span className="truncate font-mono">{acc.email}</span>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="px-3 py-3.5 whitespace-nowrap">
                            {acc.status === "LIVE" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
                                LIVE
                              </span>
                            )}
                            {acc.status === "SUSPENDED" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-bold text-purple-400 border border-purple-500/20">
                                SUSPENDED
                              </span>
                            )}
                            {acc.status === "ERROR" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-400 border border-rose-500/20">
                                ERROR
                              </span>
                            )}
                            {acc.status === "NOT_EXIST" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/20">
                                NOT EXIST
                              </span>
                            )}
                            {acc.status === "idle" && (
                              <span className="text-slate-500 font-mono">IDLE</span>
                            )}
                          </td>

                          {/* From */}
                          <td className="px-4 py-3.5 text-slate-300 max-w-[150px] truncate">
                            {firstMsg?.from || acc.sender || "-"}
                          </td>

                          {/* Time */}
                          <td className="px-4 py-3.5 font-mono text-slate-400 whitespace-nowrap">
                            {firstMsg?.date || acc.time || "-"}
                          </td>

                          {/* Exact Raw Response Content */}
                          <td className="px-6 py-3.5 max-w-[320px]">
                            <div className="flex items-center justify-between gap-2">
                              <p className="line-clamp-2 text-slate-200 leading-relaxed font-sans">
                                {acc.rawResponseContent || firstMsg?.subject || acc.statusMessage || "-"}
                              </p>
                              {hasMultipleMessages && !isExpanded && (
                                <button
                                  onClick={() => toggleExpand(acc.id)}
                                  className="shrink-0 rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
                                >
                                  +{acc.messagesList!.length - 1} more
                                </button>
                              )}
                            </div>
                          </td>

                          {/* OTP Code */}
                          <td className="px-4 py-3.5 text-center">
                            {acc.otpCode ? (
                              <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                                <span>{acc.otpCode}</span>
                                <button
                                  onClick={() => handleCopy(acc.otpCode!, acc.id)}
                                  className="hover:text-white transition-colors"
                                  title="Copy OTP"
                                >
                                  {copiedId === acc.id ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-3 py-3.5 text-right whitespace-nowrap">
                            {acc.rawResponse && (
                              <button
                                onClick={() => setSelectedRawItem(acc)}
                                className="rounded bg-slate-800 px-2 py-1 text-[11px] font-mono text-indigo-300 hover:bg-slate-700 transition-colors"
                              >
                                JSON
                              </button>
                            )}
                          </td>
                        </tr>

                        {/* Collapsible Expanded Rows for All Inbox Messages */}
                        {isExpanded && acc.messagesList && acc.messagesList.length > 1 && (
                          acc.messagesList.slice(1).map((subMsg, subIdx) => (
                            <tr
                              key={`${acc.id}-sub-${subIdx}`}
                              className="bg-slate-900/60 border-l-2 border-indigo-500/50 text-[11px]"
                            >
                              <td className="px-3 py-2 text-center text-slate-500 font-mono">
                                └ {subIdx + 2}
                              </td>
                              <td className="px-4 py-2 text-slate-400 font-mono italic">
                                {acc.email}
                              </td>
                              <td className="px-3 py-2">
                                <span className="text-slate-500">Inbox Msg</span>
                              </td>
                              <td className="px-4 py-2 text-slate-300 truncate max-w-[150px]">
                                {subMsg.from || "-"}
                              </td>
                              <td className="px-4 py-2 font-mono text-slate-400 whitespace-nowrap">
                                {subMsg.date || "-"}
                              </td>
                              <td className="px-6 py-2 text-slate-300 max-w-[320px] truncate">
                                {subMsg.subject || subMsg.message || "-"}
                              </td>
                              <td className="px-4 py-2 text-center">
                                {subMsg.code ? (
                                  <div className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-400 border border-emerald-500/20 font-mono font-bold text-[11px]">
                                    <span>{subMsg.code}</span>
                                    <button
                                      onClick={() => handleCopy(subMsg.code!, `${acc.id}-${subIdx}`)}
                                      className="hover:text-white transition-colors"
                                    >
                                      {copiedId === `${acc.id}-${subIdx}` ? (
                                        <Check className="h-3 w-3 text-emerald-300" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-slate-600">-</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-right"></td>
                            </tr>
                          ))
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* JSON Viewer Modal */}
      {selectedRawItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-semibold text-white font-mono text-sm">
                Raw Response JSON — {selectedRawItem.email}
              </h3>
              <button
                onClick={() => setSelectedRawItem(null)}
                className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Status Category: <span className="font-bold text-indigo-400">{selectedRawItem.status}</span>
            </div>
            <pre className="mt-4 max-h-96 overflow-y-auto rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 border border-slate-800">
              {JSON.stringify(selectedRawItem.rawResponse, null, 2)}
            </pre>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedRawItem(null)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* High-End Glassmorphic Custom Alert Modal */}
      {customAlert.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-2xl p-5 shadow-2xl border border-amber-500/30 bg-[#0E1322]/90">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                </div>
                <h3 className="font-bold text-white text-sm tracking-wide">
                  {customAlert.title}
                </h3>
              </div>
              <button
                onClick={closeAlert}
                className="rounded-lg bg-slate-800/80 p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 text-xs leading-relaxed text-slate-300">
              {customAlert.message}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeAlert}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-xs font-semibold text-white hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
