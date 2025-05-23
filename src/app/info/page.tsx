"use client";

import React from "react";
import "../../styles/info.css";
import strings from "../../i18n/info.json";

export default function InfoPage() {
  const addCuteEffect = (text: string) => {
    return text
      .replace(
        /artificial intelligence/g,
        '<span class="cute-effect">artificial intelligence</span>',
      )
      .replace(
        /scientists have studied the stars/g,
        '<span class="cute-effect">scientists have studied the stars</span>',
      )
      .replace(
        /fully decentralized and crypto-native/g,
        '<span class="cute-effect">fully decentralized and crypto-native</span>',
      )
      .replace(
        /rigorous language/g,
        '<span class="cute-effect">rigorous language</span>',
      )
      .replace(
        /intuitive, safe, and friendly platform/g,
        '<span class="cute-effect">intuitive, safe, and friendly platform</span>',
      )
      .replace(
        /you'll love it/g,
        "<span class='cute-effect'>you'll love it</span>",
      )
      .replace(
        /real-time celestial pattern analysis with collective data from multiple sources/g,
        '<span class="cute-effect">real-time celestial pattern analysis with collective data from multiple sources</span>',
      );
  };

  return (
    <main>
      <div className="info-container">
        <h1 className="info-title">{strings.en.title}</h1>
        <div className="info-box">
          <div className="info-content">
            <p
              dangerouslySetInnerHTML={{
                __html: addCuteEffect(strings.en.description.first_paragraph),
              }}
            />
            <p
              dangerouslySetInnerHTML={{
                __html: addCuteEffect(strings.en.description.second_paragraph),
              }}
            />
            <p
              dangerouslySetInnerHTML={{
                __html: addCuteEffect(strings.en.description.third_paragraph),
              }}
            />
          </div>
          <div className="info-signature">
            <div className="signature-love">{strings.en.signature.love}</div>
            <div className="signature-name">{strings.en.signature.name}</div>
          </div>
        </div>
      </div>
    </main>
  );
}

export const dynamic = "force-dynamic";
