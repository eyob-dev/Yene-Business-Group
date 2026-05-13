import React, { useEffect, useState } from "react";
import { Card } from "./components/Card";
import { Button } from "./components/Button";
import {
  Phone,
  MessageCircle,
  Search,
  Moon,
  Sun,
  Linkedin,
} from "lucide-react";
import { COMPANY_DATA } from "./constants";

function getProposalApiCandidates() {
  if (typeof window === "undefined") {
    return ["/api/send-proposal"];
  }

  const sameOriginUrl = new URL(
    "/api/send-proposal",
    window.location.origin,
  ).toString();
  const localServerUrl = "http://localhost:3000/api/send-proposal";

  return Array.from(new Set([sameOriginUrl, localServerUrl]));
}

function getReadableErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export default function YeneBusinessWebApp() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [search, setSearch] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, [isDark]);

  // const token = process.env.TELEGRAM_BOT_TOKEN;
  // const chatId = process.env.TELEGRAM_CHAT_ID;

  // console.log("TOKEN:", token);
  // console.log("CHAT ID:", chatId);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setIsSearching(true);
    setChatAnswer("");

    // Simulate slight delay for "bot feel"
    await new Promise((resolve) => setTimeout(resolve, 600));

    const user_input = search.toLowerCase();

    let answer =
      "Thank you for contacting Yene Business Group. How can we assist you today?";

    if (user_input.includes("service")) {
      answer = COMPANY_DATA.services_desc;
    } else if (
      user_input.includes("contact") ||
      user_input.includes("phone") ||
      user_input.includes("email")
    ) {
      answer = `You can contact us at ${COMPANY_DATA.contact.phone} or via email at ${COMPANY_DATA.contact.email}.`;
    } else if (
      user_input.includes("location") ||
      user_input.includes("where")
    ) {
      answer = `Our office is located in ${COMPANY_DATA.contact.location}.`;
    } else if (
      user_input.includes("about") ||
      user_input.includes("company") ||
      user_input.includes("what do you do")
    ) {
      answer = COMPANY_DATA.overview;
    } else if (user_input.includes("mission")) {
      answer = `Our mission is: ${COMPANY_DATA.mission.join(", ")}`;
    } else if (user_input.includes("value")) {
      answer = `Our core values are: ${COMPANY_DATA.core_values.join(", ")}`;
    }

    setChatAnswer(answer);
    setIsSearching(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const safeForm = {
      name: String(form.name || ""),
      email: String(form.email || ""),
      phone: String(form.phone || ""),
      service: String(form.service || ""),
      message: String(form.message || ""),
    };

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const endpoints = getProposalApiCandidates();
      let response: Response | null = null;
      let lastNetworkError = "";

      for (const endpoint of endpoints) {
        try {
          response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(safeForm),
          });
          break;
        } catch (error) {
          lastNetworkError = getReadableErrorMessage(error);
          console.error(`Failed to reach ${endpoint}`, error);
        }
      }

      if (!response) {
        throw new Error(
          lastNetworkError || "Could not reach the backend server.",
        );
      }

      if (response.ok) {
        setSubmitStatus("success");
        setForm({ name: "", email: "", phone: "", service: "", message: "" });
        setTimeout(() => setSubmitStatus("idle"), 5000);
      } else {
        const text = await response.text();
        let errorMsg = `Server returned ${response.status}`;
        try {
          const errorData = JSON.parse(text);
          errorMsg = errorData.error || errorData.errorMessage || errorMsg;
        } catch (e) {
          errorMsg = "Server error. Please refresh.";
        }
        setErrorMessage(errorMsg);
        setSubmitStatus("error");
      }
    } catch (error) {
      const message =
        getReadableErrorMessage(error) || "Network request failed";
      console.error("Proposal submission failed:", error);
      setErrorMessage(message);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 font-sans ${isDark ? "bg-[#111] text-gray-200" : "bg-gray-50 text-gray-900"}`}
    >
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-md ${isDark ? "border-[#333] bg-[#111]/80" : "border-gray-200 bg-white/80"}`}
      >
        <div className="max-w-md mx-auto px-4 py-4 flex flex-col items-center gap-4">
          <img
            src="https://www.image2url.com/r2/default/images/1776966525175-29c39769-c5e4-4351-a636-18f7f4bf4a84.png"
            alt="Logo"
            className="h-20 lg:h-28 w-auto"
          />
          <div className="flex items-center justify-center gap-2 w-full">
            <form
              onSubmit={handleSearch}
              className="flex flex-1 justify-center"
            >
              <input
                type="text"
                placeholder="Ask us anything..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`px-4 py-2 rounded-full border ${isDark ? "bg-[#1a1a1a] border-[#333]" : "bg-white border-gray-200"} text-sm w-full`}
              />
              <button
                type="submit"
                className={`px-4 py-2 rounded-full border ${isDark ? "bg-[#1a1a1a] border-[#333] hover:bg-[#333]" : "bg-white border-gray-200 hover:bg-gray-100"} text-sm`}
              >
                {isSearching ? "..." : <Search size={16} />}
              </button>
            </form>
            <button
              onClick={() =>
                setTheme((prev) => (prev === "light" ? "dark" : "light"))
              }
              className={`p-3 rounded-full transition-colors ${isDark ? "hover:bg-[#333]" : "hover:bg-gray-200"}`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10 grid md:grid-cols-3 gap-8">
        {chatAnswer && (
          <div className="md:col-span-3 p-6 rounded-3xl border bg-[#B8860B]/10 border-[#B8860B]/20">
            <h3 className="font-semibold text-lg text-[#B8860B] mb-2">
              Yene Assistant
            </h3>
            <p className="leading-relaxed whitespace-pre-wrap">{chatAnswer}</p>
            <Button className="mt-4" onClick={() => setChatAnswer("")}>
              Close
            </Button>
          </div>
        )}
        <section className="md:col-span-1">
          <Card
            className={`p-6 rounded-3xl border h-full ${isDark ? "bg-[#1a1a1a] border-[#333]" : "bg-white border-gray-100"}`}
          >
            <h2 className="font-serif italic text-xl mb-6 text-[#B8860B]">
              Our Services
            </h2>
            <div className="space-y-6">
              {[
                {
                  title: "WebApp & System Design and Development",
                  desc: "We build reliable digital systems that power modern businesses.",
                },
                {
                  title:
                    "Digital Marketing & Business to Digital Transformation",
                  desc: "We help businesses move from manual operations to smart, automated workflows.",
                },
                {
                  title: "Graphics Design & Brand Identity",
                  desc: "We design visuals that make brands look professional and trustworthy.",
                },
                {
                  title: "Logistics and Import/Export Solutions",
                  desc: "We support product movement, sourcing, and supply chain coordination.",
                },
                {
                  title: "Education & Training Services",
                  desc: "We train individuals and teams on digital tools, systems, and business technology.",
                },
              ].map((service) => (
                <div key={service.title}>
                  <p className="font-medium text-base text-[#B8860B] mb-0.5">
                    {service.title}
                  </p>
                  <p className="text-sm opacity-80 leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="md:col-span-2 space-y-8">
          <Card
            className={`p-6 rounded-3xl border ${isDark ? "bg-[#1a1a1a] border-[#333]" : "bg-white border-gray-100"}`}
          >
            <h2 className="font-serif italic text-xl mb-6 text-[#B8860B]">
              Contact Us
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                className={`h-24 flex flex-col items-center justify-center gap-2 ${isDark ? "bg-[#222]" : "bg-gray-50"} border ${isDark ? "border-[#333]" : "border-gray-200"} hover:border-[#B8860B]/50 transition-all`}
                onClick={() => (window.location.href = "tel:+251964110744")}
              >
                <Phone size={20} className="text-[#B8860B]" />{" "}
                <span className="text-xs">Call Now</span>
              </Button>
              <Button
                className={`h-24 flex flex-col items-center justify-center gap-2 ${isDark ? "bg-[#222]" : "bg-gray-50"} border ${isDark ? "border-[#333]" : "border-gray-200"} hover:border-[#B8860B]/50 transition-all`}
                onClick={() =>
                  (window.location.href = "https://wa.me/251964110744")
                }
              >
                <MessageCircle size={20} className="text-[#B8860B]" />{" "}
                <span className="text-xs">WhatsApp</span>
              </Button>
              <Button
                className={`h-24 flex flex-col items-center justify-center gap-2 ${isDark ? "bg-[#222]" : "bg-gray-50"} border ${isDark ? "border-[#333]" : "border-gray-200"} hover:border-[#B8860B]/50 transition-all`}
                onClick={() =>
                  window.open("https://t.me/YeneBusinessGroup", "_blank")
                }
              >
                <span className="text-xl font-bold font-sans text-[#B8860B]">
                  T
                </span>{" "}
                <span className="text-xs">Telegram</span>
              </Button>
              <Button
                className={`h-24 flex flex-col items-center justify-center gap-2 ${isDark ? "bg-[#222]" : "bg-gray-50"} border ${isDark ? "border-[#333]" : "border-gray-200"} hover:border-[#B8860B]/50 transition-all`}
                onClick={() =>
                  window.open(
                    "https://www.linkedin.com/in/eyobtamiru?utm_source=share_via&utm_content=profile&utm_medium=member_android",
                    "_blank",
                  )
                }
              >
                <Linkedin size={20} className="text-[#B8860B]" />{" "}
                <span className="text-xs">LinkedIn</span>
              </Button>
            </div>
          </Card>

          <Card
            className={`p-8 rounded-3xl border ${isDark ? "bg-[#1a1a1a] border-[#333]" : "bg-white border-gray-200"} shadow-lg`}
          >
            <h2 className="text-2xl font-serif italic mb-6">
              Request Proposal
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                className={`w-full rounded-2xl p-4 border ${isDark ? "bg-black border-[#333]" : "bg-gray-50 border-gray-200"}`}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={form.email}
                onChange={handleChange}
                className={`w-full rounded-2xl p-4 border ${isDark ? "bg-black border-[#333]" : "bg-gray-50 border-gray-200"}`}
                required
              />
              <select
                name="service"
                value={form.service}
                onChange={handleChange}
                className={`w-full rounded-2xl p-4 border ${isDark ? "bg-black border-[#333]" : "bg-gray-50 border-gray-200"}`}
                required
              >
                <option value="">Choosing a Service</option>
                {COMPANY_DATA.all_services.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <textarea
                name="message"
                placeholder="Project Details"
                value={form.message}
                onChange={handleChange}
                className={`w-full rounded-2xl p-4 border ${isDark ? "bg-black border-[#333]" : "bg-gray-50 border-gray-200"}`}
                rows={4}
                required
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-14 rounded-full font-bold transition-all ${isDark ? "bg-white text-black hover:bg-gray-200" : "bg-[#1A1A1A] text-white hover:bg-black"}`}
              >
                {isSubmitting ? "Sending..." : "Send Proposal"}
              </Button>
              {submitStatus === "success" && (
                <div className="p-3 bg-green-50 text-green-800 rounded-xl text-center font-medium border border-green-200">
                  Proposal sent successfully!
                </div>
              )}
              {submitStatus === "error" && (
                <div className="p-3 bg-red-50 text-red-800 rounded-xl text-center font-medium border border-red-200">
                  Failed: {errorMessage}
                </div>
              )}
            </form>
          </Card>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t mt-12 flex items-center gap-6">
        <img
          src="https://www.image2url.com/r2/default/images/1776966525175-29c39769-c5e4-4351-a636-18f7f4bf4a84.png"
          alt="Logo"
          className="h-16 w-auto grayscale"
        />
        <div className="opacity-60 text-sm">
          © 2026 Yene Business Group. Premium Digital Solutions center
        </div>
      </footer>
    </div>
  );
}
