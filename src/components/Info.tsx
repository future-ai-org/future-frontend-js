import "../styles/info.css";
import strings from "../i18n/info.json";

export default function Info() {
  return (
    <div className="infoContainer">
      <h1 className="page-title">{strings.en.info.title}</h1>
      <section className="infoSection">
        <p className="infoParagraph">{strings.en.info.welcome}</p>
        <p className="infoParagraph">{strings.en.info.mission}</p>
      </section>
    </div>
  );
}
