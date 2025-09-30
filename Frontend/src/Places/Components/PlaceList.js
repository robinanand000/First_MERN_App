import React, { useContext } from "react";
import Card from "../../Shared/Components/UIElements/Card";
import PlaceItem from "./PlaceItem";
import "./PlaceList.css";
import Button from "../../Shared/Components/FormElements/Button";
import { AuthContext } from "../../Shared/Context/auth-context";

const PlaceList = (props) => {
  const Auth = useContext(AuthContext);

  if (props.items.length === 0 && Auth.userId === props.placeCreatorId) {
    return (
      <div className="place-list center">
        <Card>
          <h2>No Places Found. Maybe create one?</h2>
          <Button to="/places/new">Share Place</Button>
        </Card>
      </div>
    );
  } else if (props.items.length === 0) {
    return (
      <div className="place-list center">
        <Card>
          <h2>No Places uploaded yet.</h2>
        </Card>
      </div>
    );
  }

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
