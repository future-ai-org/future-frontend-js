"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import strings from "../i18n/logia.json";
import LogiaChart from "./LogiaChart";
import { searchCities, CitySuggestion } from "../utils/geocoding";
import Loading from "../utils/loading";
import { SpaceDecoration } from "../utils/spaceDecoration";
import { useWeb3 } from "../utils/web3ModalContext";
import { WALLET_CONFIG } from "../config/wallet";
import { useCssLoader } from "../utils/useCssLoader";

const t = strings.en;

interface FormData {
  birthDate: string;
  birthTime: string;
  city: string;
  name: string;
}

interface LogiaFormProps {
  onSubmit: (data: FormData) => void;
  isGeneratingChart: boolean;
  error: string | null;
}

export default function Logia() {
  const [formData, setFormData] = useState<FormData>({
    birthDate: "",
    birthTime: "",
    city: "",
    name: "",
  });
  const [showChart, setShowChart] = useState(false);
  const isCssLoaded = useCssLoader();

  const handleSubmit = useCallback((data: FormData) => {
    setFormData(data);
    setShowChart(true);
  }, []);

  const renderContent = () => {
    if (!showChart) {
      return (
        <div className="logia-centered-content">
          <h1 className="logia-title">{t.title.toLowerCase()}</h1>
          <div className="logia-container">
            <LogiaForm
              onSubmit={handleSubmit}
              isGeneratingChart={false}
              error={null}
            />
          </div>
        </div>
      );
    }

    return (
      <LogiaChart
        birthDate={formData.birthDate}
        birthTime={formData.birthTime}
        city={formData.city}
        name={formData.name}
        isGeneratingChart={false}
      />
    );
  };

  if (!isCssLoaded) {
    return (
      <div className="astrology-container">
        <Loading />
      </div>
    );
  }

  return (
    <div className="astrology-container">
      {!showChart && <LogiaInfoBox />}
      <div className="astrology-form-section">{renderContent()}</div>
      {!showChart && (
        <div className="logia-decorative-image">
          <SpaceDecoration />
        </div>
      )}
    </div>
  );
}

function LogiaForm({ onSubmit, isGeneratingChart, error }: LogiaFormProps) {
  const [formData, setFormData] = useState<FormData>({
    birthDate: "",
    birthTime: "",
    city: "",
    name: "",
  });
  const [useMyself, setUseMyself] = useState(false);
  const { ensName, isConnected, address, connect } = useWeb3();
  const [timePeriod, setTimePeriod] = useState<
    typeof t.labels.am | typeof t.labels.pm
  >(t.labels.am);
  const [isUnsure, setIsUnsure] = useState(false);
  const [showTimePeriodSuggestions, setShowTimePeriodSuggestions] =
    useState(false);
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const yearInputRef = useRef<HTMLInputElement>(null);
  const monthInputRef = useRef<HTMLInputElement>(null);
  const dayInputRef = useRef<HTMLInputElement>(null);
  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);

  const formatAddress = useCallback((addr: string | undefined) => {
    if (!addr) return "";
    return `${addr.slice(0, WALLET_CONFIG.ADDRESS.PREFIX_LENGTH)}...${addr.slice(-WALLET_CONFIG.ADDRESS.SUFFIX_LENGTH)}`;
  }, []);

  const handleYearChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const year = e.target.value.replace(/\D/g, "").slice(0, 4);
      const [, month, day] = formData.birthDate.split("-");
      setFormData((prev) => ({
        ...prev,
        birthDate: `${year}-${month || ""}-${day || ""}`,
      }));
      if (year.length === 4) {
        monthInputRef.current?.focus();
      }
    },
    [formData.birthDate],
  );

  const handleMonthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let month = e.target.value.replace(/\D/g, "");
      if (month) {
        const numMonth = parseInt(month, 10);
        if (numMonth > 12) month = "12";
        if (numMonth < 1) month = "01";
      }
      const [year, , day] = formData.birthDate.split("-");
      setFormData((prev) => ({
        ...prev,
        birthDate: `${year || ""}-${month}-${day || ""}`,
      }));
      if (month.length === 2) {
        dayInputRef.current?.focus();
      }
    },
    [formData.birthDate],
  );

  const handleDayChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let day = e.target.value.replace(/\D/g, "");
      if (day) {
        const numDay = parseInt(day, 10);
        if (numDay > 31) day = "31";
        if (numDay < 1) day = "01";
      }
      const [year, month] = formData.birthDate.split("-");
      setFormData((prev) => ({
        ...prev,
        birthDate: `${year || ""}-${month || ""}-${day}`,
      }));
      if (day.length === 2) {
        hourInputRef.current?.focus();
      }
    },
    [formData.birthDate],
  );

  const handleHourChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let hour = e.target.value.replace(/\D/g, "");
      if (hour) {
        const numHour = parseInt(hour, 10);
        if (numHour > 12) hour = "12";
        if (numHour < 1) hour = "01";
      }
      const [, minute] = formData.birthTime.split(":");
      setFormData((prev) => ({
        ...prev,
        birthTime: `${hour}:${minute || ""}`,
      }));
      if (hour.length === 2) {
        minuteInputRef.current?.focus();
      }
    },
    [formData.birthTime],
  );

  const handleMinuteChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let minute = e.target.value.replace(/\D/g, "");
      if (minute) {
        const numMinute = parseInt(minute, 10);
        if (numMinute > 59) minute = "59";
        if (numMinute < 0) minute = "00";
      }
      const [hour] = formData.birthTime.split(":");
      setFormData((prev) => ({
        ...prev,
        birthTime: `${hour || ""}:${minute}`,
      }));
      if (minute.length === 2) {
        cityInputRef.current?.focus();
      }
    },
    [formData.birthTime],
  );

  const handleCityChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, city: value }));

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(async () => {
        if (value.trim()) {
          const suggestions = await searchCities(value);
          setCitySuggestions(suggestions);
          setShowSuggestions(true);
        } else {
          setCitySuggestions([]);
          setShowSuggestions(false);
        }
      }, 300);
    },
    [],
  );

  const handleCitySelect = useCallback((suggestion: CitySuggestion) => {
    setFormData((prev) => ({ ...prev, city: suggestion.display_name }));
    setCitySuggestions([]);
    setShowSuggestions(false);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.birthDate || !formData.birthTime || !formData.city) return;
      const [hour, minute] = formData.birthTime.split(":");
      let hour24 = parseInt(hour, 10);
      if (isUnsure) {
        hour24 = 12;
      } else {
        if (timePeriod === t.labels.pm && hour24 < 12) hour24 += 12;
        if (timePeriod === t.labels.am && hour24 === 12) hour24 = 0;
      }

      const time24 = `${hour24}:${minute}`;
      onSubmit({ ...formData, birthTime: time24 });
    },
    [formData, timePeriod, isUnsure, onSubmit],
  );

  const handleBlur = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  const handleMyselfCheckbox = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const shouldCheck = e.target.checked;
      setUseMyself(shouldCheck);

      if (!shouldCheck) {
        setFormData((prev) => ({ ...prev, name: "" }));
        return;
      }

      if (!isConnected) {
        try {
          await connect();
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error("Failed to connect wallet:", error);
          setUseMyself(false);
          return;
        }
      }

      const displayName = ensName || (address ? formatAddress(address) : "");
      if (displayName) {
        setFormData((prev) => ({ ...prev, name: displayName }));
      }
    },
    [isConnected, connect, ensName, address, formatAddress],
  );

  useEffect(() => {
    if (useMyself) {
      const displayName = ensName || (address ? formatAddress(address) : "");
      if (displayName) {
        setFormData((prev) => ({ ...prev, name: displayName }));
      }
    }
  }, [useMyself, ensName, address, formatAddress]);

  return (
    <form className="astrology-form" onSubmit={handleSubmit}>
      <div className="astrology-form-group">
        <label className="astrology-label">{t.labels.name}</label>
        <div className="astrology-input-group">
          <input
            className={`astrology-input ${useMyself ? "disabled-by-checkbox" : ""}`}
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder={t.labels.namePlaceholder}
            required
          />
          <div className="astrology-unsure-checkbox">
            <input
              type="checkbox"
              id="myself-checkbox"
              checked={useMyself}
              onChange={handleMyselfCheckbox}
            />
            <label htmlFor="myself-checkbox">myself</label>
          </div>
        </div>
      </div>
      <div className="astrology-form-group">
        <label className="astrology-label">{t.labels.birthDate}</label>
        <div className="astrology-input-group">
          <input
            ref={yearInputRef}
            className="astrology-input astrology-input-year"
            type="text"
            name="birthYear"
            value={formData.birthDate.split("-")[0] || ""}
            onChange={handleYearChange}
            placeholder={t.labels.yearPlaceholder}
            maxLength={4}
            required
          />
          <input
            ref={monthInputRef}
            className="astrology-input astrology-input-short"
            type="text"
            name="birthMonth"
            value={formData.birthDate.split("-")[1] || ""}
            onChange={handleMonthChange}
            placeholder={t.labels.monthPlaceholder}
            maxLength={2}
            required
          />
          <input
            ref={dayInputRef}
            className="astrology-input astrology-input-short"
            type="text"
            name="birthDay"
            value={formData.birthDate.split("-")[2] || ""}
            onChange={handleDayChange}
            placeholder={t.labels.dayPlaceholder}
            maxLength={2}
            required
          />
        </div>
      </div>
      <div className="astrology-form-group">
        <label className="astrology-label">{t.labels.birthTime}</label>
        <div className="astrology-input-group">
          <input
            ref={hourInputRef}
            className={`astrology-input astrology-input-short ${isUnsure ? "disabled-by-checkbox" : ""}`}
            type="text"
            name="birthHour"
            value={formData.birthTime.split(":")[0] || ""}
            onChange={handleHourChange}
            placeholder={t.labels.hourPlaceholder}
            maxLength={2}
            required
          />
          <input
            ref={minuteInputRef}
            className={`astrology-input astrology-input-short ${isUnsure ? "disabled-by-checkbox" : ""}`}
            type="text"
            name="birthMinute"
            value={formData.birthTime.split(":")[1] || ""}
            onChange={handleMinuteChange}
            placeholder={t.labels.minutePlaceholder}
            maxLength={2}
            required
          />
          <input
            className={`astrology-input astrology-time-period-select ${isUnsure ? "disabled-by-checkbox" : ""}`}
            type="text"
            value={timePeriod}
            onChange={(e) => {
              setTimePeriod(
                e.target.value as typeof t.labels.am | typeof t.labels.pm,
              );
              cityInputRef.current?.focus();
            }}
            onFocus={() => setShowTimePeriodSuggestions(true)}
            onBlur={() =>
              setTimeout(() => setShowTimePeriodSuggestions(false), 200)
            }
            readOnly
          />
          <div className="astrology-unsure-checkbox">
            <input
              type="checkbox"
              id="unsure-checkbox"
              checked={isUnsure}
              onChange={(e) => {
                setIsUnsure(e.target.checked);
                if (e.target.checked) {
                  setTimePeriod(t.labels.pm);
                  setFormData((prev) => ({
                    ...prev,
                    birthTime: "12:00",
                  }));
                  cityInputRef.current?.focus();
                }
              }}
            />
            <label htmlFor="unsure-checkbox">{t.labels.unsureTime}</label>
          </div>
          {showTimePeriodSuggestions && (
            <ul className="astrology-city-suggestions">
              <li
                onClick={() => {
                  setTimePeriod(t.labels.am);
                  setShowTimePeriodSuggestions(false);
                  cityInputRef.current?.focus();
                }}
                className="astrology-city-suggestion"
              >
                {t.labels.am}
              </li>
              <li
                onClick={() => {
                  setTimePeriod(t.labels.pm);
                  setShowTimePeriodSuggestions(false);
                  cityInputRef.current?.focus();
                }}
                className="astrology-city-suggestion"
              >
                {t.labels.pm}
              </li>
            </ul>
          )}
        </div>
      </div>
      <div className="astrology-form-group">
        <label className="astrology-label">{t.labels.birthCity}</label>
        <div className="astrology-city-input-container">
          <input
            ref={cityInputRef}
            className="astrology-input astrology-city-input"
            type="text"
            value={formData.city}
            onChange={handleCityChange}
            onBlur={handleBlur}
            placeholder={t.labels.cityPlaceholder}
            required
          />
          {showSuggestions && citySuggestions.length > 0 && (
            <ul className="astrology-city-suggestions">
              {citySuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleCitySelect(suggestion)}
                  className="astrology-city-suggestion"
                >
                  {suggestion.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
        {error && <div className="astrology-error-message">{error}</div>}
      </div>
      <button
        className="astrology-button"
        type="submit"
        disabled={isGeneratingChart}
      >
        {isGeneratingChart ? <Loading /> : t.buttons.generateChart}
      </button>
      <p className="logia-disclaimer">{t.disclaimer}</p>
    </form>
  );
}

function LogiaInfoBox() {
  return (
    <div className="logia-info-wrapper">
      <div className="logia-info-box">
        <h2 className="logia-about-title">{t.about.title}</h2>
        <div className="logia-about-features">
          {t.about.features.map((feature, index) => {
            const number = feature.split(" ")[0];
            const text = feature.split(" ").slice(1).join(" ");
            return (
              <p key={index} className="logia-about-feature">
                <span className="logia-feature-number">{number}</span> {text}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
