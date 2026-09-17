import { useEffect, useState } from "react";
import SocietyCard from "../components/SocietyCard.jsx";
import "./Societies.css";

function Societies() {
  const [societies, setSocieties] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetch("http://localhost:5000/api/societies")
      .then((response) => response.json())
      .then((data) => {
        setSocieties(data);
      })
      .catch((error) => {
        console.error("Failed to fetch societies:", error);
      });
  }, []);

  const categories = [
    "All",
    "Technical",
    "Cultural",
    "Creative",
    "Sports",
  ];

  const filteredSocieties = societies.filter((society) => {
    const matchesSearch = society.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" ||
      society.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="societies-page">

      <section className="societies-header">
        <p className="section-label">EXPLORE</p>

        <h1>Societies</h1>

        <p>
          Find communities, discover opportunities, and get involved at NSUT.
        </p>
      </section>

      <section className="societies-content">

        <div className="societies-controls">

          <input
            type="text"
            placeholder="Search societies..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="category-filters">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

        </div>

        <div className="societies-grid">

          {filteredSocieties.length > 0 ? (
            filteredSocieties.map((society) => (
              <SocietyCard
                key={society.id}
                id={society.id}
                name={society.name}
                description={society.description}
                category={society.category}
                deadline={society.deadline}
              />
            ))
          ) : (
            <p className="no-results">
              No societies found matching your search.
            </p>
          )}

        </div>

      </section>

    </main>
  );
}

export default Societies;