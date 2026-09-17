
import { Link } from "react-router-dom";
import "./SocietyCard.css";

function SocietyCard(props) {
  return (
    <article className="society-card">
      <div className="society-card-top">
        <span className="society-category">
          {props.category}
        </span>

        <span className="society-status">
          {props.deadline && new Date(props.deadline) <= new Date()
            ? "Closed"
            : "Open"}
        </span>
      </div>

      <div className="society-card-content">
        <h2>{props.name}</h2>

        <p>{props.description}</p>
      </div>

      <div className="society-card-footer">
        <Link
          to={`/societies/${props.id}`}
          className="society-card-button"
        >
          View Society
        </Link>
      </div>
    </article>
  );
}

export default SocietyCard;