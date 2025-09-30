<<<<<<< HEAD
import React, { useContext } from "react";
=======
import React from "react";
>>>>>>> 7484101f95554195f1ba8c8b54bee6548dd1ff29
import Card from "../../Shared/Components/UIElements/Card";
import PlaceItem from "./PlaceItem";
import "./PlaceList.css";
import Button from "../../Shared/Components/FormElements/Button";
<<<<<<< HEAD
import { AuthContext } from "../../Shared/Context/auth-context";

const PlaceList = (props) => {
  const Auth = useContext(AuthContext);

  if (props.items.length === 0 && Auth.userId === props.placeCreatorId) {
=======

const PlaceList = (props) => {
  if (props.items.length === 0) {
>>>>>>> 7484101f95554195f1ba8c8b54bee6548dd1ff29
    return (
      <div className="place-list center">
        <Card>
          <h2>No Places Found. Maybe create one?</h2>
          <Button to="/places/new">Share Place</Button>
        </Card>
      </div>
    );
<<<<<<< HEAD
  } else if (props.items.length === 0) {
    return (
      <div className="place-list center">
        <Card>
          <h2>No Places uploaded yet.</h2>
        </Card>
      </div>
    );
  }

=======
  }
>>>>>>> 7484101f95554195f1ba8c8b54bee6548dd1ff29
  return (
    <ul className="place-list">
      {props.items.map((place) => {
        return (
          <PlaceItem
            key={place.id}
            id={place.id}
            image={place.image}
            title={place.title}
            description={place.description}
            address={place.address}
            creatorId={place.creator}
            coordinates={place.location}
            onDelete={props.onDeletePlace}
          />
        );
      })}
    </ul>
  );
};

export default PlaceList;
