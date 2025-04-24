import "../styles/info.css";
import strings from "../i18n/info.json";

export default function Info() {
  return (
    <div className="infoContainer">
      <section className="infoSection">
        <p className="infoParagraph">
          {strings.en.description.first_paragraph}
        </p>
      </section>
    </div>
  );
}
