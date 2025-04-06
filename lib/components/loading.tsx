import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Loading() {
    return <FontAwesomeIcon icon={faSpinner} className="loading" />;
}