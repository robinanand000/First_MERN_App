import React, { useContext, useEffect, useState } from "react";
import "./PlaceForm.css";
import { useParams } from "react-router-dom";
import Button from "../../Shared/Components/FormElements/Button";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../../Shared/Util/validators";
import Input from "../../Shared/Components/FormElements/Input";
import { useForm } from "../../Shared/hooks/form-hook";
import Card from "../../Shared/Components/UIElements/Card";
import { useHttpClient } from "../../Shared/hooks/http-hook";
import LoadingSpinner from "../../Shared/Components/UIElements/LoadingSpinner";
import ErrorModal from "../../Shared/Components/UIElements/ErrorModal";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { AuthContext } from "../../Shared/Context/auth-context";

const UpdatePlace = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedPlace, setLoadedPlace] = useState();
  const history = useHistory();
  const auth = useContext(AuthContext);

  const placeId = useParams().placeId;

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        val: "",
        isValid: false,
      },
      description: {
        val: "",
        isValid: false,
      },
    },
    false
  );

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`
        );
        setLoadedPlace(responseData.place);
        setFormData(
          {
            title: {
              val: responseData.place.title,
              isValid: true,
            },
            description: {
              val: responseData.place.description,
              isValid: true,
            },
          },
          true
        );
      } catch (error) {}
    };
    fetchPlace();
  }, [sendRequest, placeId, setFormData]);

  const placeUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`,
        "PATCH",
        JSON.stringify({
          title: formState.inputs.title.val,
          description: formState.inputs.description.val,
        }),
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        }
      );
      history.push(`/${auth.userId}/places`);
    } catch (error) {}
  };

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner asOverlay />
      </div>
    );
  }

  if (!loadedPlace && !error) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find place!</h2>
        </Card>
      </div>
    );
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedPlace && (
        <form
          action=""
          className="place-form"
          onSubmit={placeUpdateSubmitHandler}
        >
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid title"
            onInput={inputHandler}
            initialValid={true}
            initialValue={loadedPlace.title}
          />
          <Input
            id="description"
            element="textarea"
            label="Description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a valid description (at least 5 characters)"
            onInput={inputHandler}
            initialValid={true}
            initialValue={loadedPlace.description}
          />

          <Button type="submit" disabled={!formState.isValid}>
            Update Place
          </Button>
        </form>
      )}
    </React.Fragment>
  );
};

export default UpdatePlace;
