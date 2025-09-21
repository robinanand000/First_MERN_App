import React, { useContext } from "react";
import Card from "../../Shared/Components/UIElements/Card";
import "./PlaceItem.css";
import Button from "../../Shared/Components/FormElements/Button";
import { useState } from "react";
import Modal from "../../Shared/Components/UIElements/Modal";
import Map from "../../Shared/Components/UIElements/Map";
import { AuthContext } from "../../Shared/Context/auth-context";
import { useHttpClient } from "../../Shared/hooks/http-hook";
import ErrorModal from "../../Shared/Components/UIElements/ErrorModal";
import LoadingSpinner from "../../Shared/Components/UIElements/LoadingSpinner";

const PlaceItem = (props) => {
  const [showMap, setShowMap] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const openMapHandler = () => {
    setShowMap(true);
  };
  const closeMapHandler = () => {
    setShowMap(false);
  };

  const showConfirmModalHandler = () => {
    setShowConfirmModal(true);
  };
  const cancleConfirmModalHandler = () => {
    setShowConfirmModal(false);
  };

  const confirmDeleteHandler = async () => {
    setShowConfirmModal(false);

    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/places/${props.id}`,
        "DELETE",
        null,
        { Authorization: "Bearer " + auth.token }
      );
      props.onDelete(props.id);
    } catch (error) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Modal
        show={showMap}
        onCancel={closeMapHandler}
        header={props.address}
        contentClass="place-item__modal-content"
        footerClass="place-item__modal-actions"
        footer={<Button onClick={closeMapHandler}>Close</Button>}
      >
        <Map center={props.coordinates} className="map-container" zoom={15} />
      </Modal>

      <Modal
        header="Are you Sure?"
        footerClass="place-item__modal-actions"
        show={showConfirmModal}
        onCancel={cancleConfirmModalHandler}
        footer={
          <React.Fragment>
            <Button inverse onClick={cancleConfirmModalHandler}>
              CANCLE
            </Button>
            <Button danger onClick={confirmDeleteHandler}>
              DELETE
            </Button>
          </React.Fragment>
        }
      >
        <p>Do you want to proceed and delete this place?</p>
      </Modal>

      {isLoading && <LoadingSpinner asOverlay />}
      {!isLoading && (
        <li className="place-item">
          <Card className="place-item__content">
            <div className="place-item__image">
              <img
                src={`${process.env.REACT_APP_ASSET_URL}/${props.image}`}
                alt={props.title}
              />
            </div>
            <div className="place-item__info">
              <h2>{props.title}</h2>
              <h3>{props.address}</h3>
              <p>{props.description}</p>
            </div>
            <div className="place-item__actions">
              <Button inverse onClick={openMapHandler}>
                VIEW ON MAP
              </Button>
              {auth.userId === props.creatorId && (
                <Button to={`/places/${props.id}`}>Edit</Button>
              )}
              {auth.userId === props.creatorId && (
                <Button danger onClick={showConfirmModalHandler}>
                  Delete
                </Button>
              )}
            </div>
          </Card>
        </li>
      )}
    </React.Fragment>
  );
};

export default PlaceItem;
