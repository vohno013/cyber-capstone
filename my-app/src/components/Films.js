import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";

function Films() {
  let [film, setFilm] = useState({});
  let navigate = useNavigate();
  let params = useParams();

  async function getFilm() {
    let fetchedFilm = await api(`/films/${params.id}`);
    fetchedFilm.planets = await api(`/films/${params.id}/planets`);
    fetchedFilm.characters = await api(`/films/${params.id}/characters`);
    setFilm(fetchedFilm);
  }

  useEffect(() => {
    getFilm();
  }, [params.id]);

  function handlePlanetClick(id) {
    navigate(`/planets/${id}`);
  }

  function handleCharacterClick(id) {
    navigate(`/characters/${id}`);
  }

  return (
    <>
      <main>
        <h1 id="film_title">{film.title}</h1>
        <section id="generalInfo">
          <p>
            <span id="crawl">{film.opening_crawl}</span>
          </p>
          <p>
            Director: <span id="director">{film.director}</span>
          </p>
          <p>
            Release Date: <span id="release">{film.release_date}</span>
          </p>
        </section>
        <section id="characters">
          <h2>Appearing Characters:</h2>
          <ul>
            {film.characters
              ? film.characters.map((character) => (
                  <li
                    className="character"
                    key={character.id}
                    onClick={() => handleCharacterClick(character.id)}
                  >
                    {character.name}
                  </li>
                ))
              : ""}
          </ul>
        </section>
        <section id="planets">
          <h2>Appearing Planets:</h2>
          <ul>
            {film.planets
              ? film.planets.map((planet) => (
                  <li
                    className="planets"
                    key={planet.id}
                    onClick={() => handlePlanetClick(planet.id)}
                  >
                    {planet.name}
                  </li>
                ))
              : ""}
          </ul>
        </section>
      </main>
    </>
  );
}

export default Films;
