import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

function Characters() {
  let [charList, setCharList] = useState([]);
  let navigate = useNavigate();

  const fetchCharacters = async () => {
    const data = await api("/characters");
    setCharList(data);
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  function handleClick(id) {
    navigate(`/characters/${id}`);
  }

  return (
    <>
      <section id="charactersList">
        {charList.map((character) => (
          <div key={character.id} onClick={() => handleClick(character.id)}>
            {character.name}
          </div>
        ))}
      </section>
    </>
  );
}

export default Characters;
