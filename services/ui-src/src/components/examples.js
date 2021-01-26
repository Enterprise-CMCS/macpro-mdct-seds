import React from "react";
import StatusButton from "./StatusButton";
import {
  Accordion,
  Alert,
  Button,
  Grid,
  GridContainer
} from "@trussworks/react-uswds";

// FontAwesome / Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faArrowLeft,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";

// Tabs
import "react-tabs/style/react-tabs.css";
import TabContainer from "./layout/TabContainer";

const Example = () => {
  let accordionItems = [
    {
      id: 1,
      description: "Settings description",
      title: "Settings 1",
      content: "Here is the content"
    },
    {
      id: 2,
      description: "Settings 2 description",
      title: "Settings 2",
      content: "Here is the content for settings 2"
    },
    {
      id: 3,
      description: "Settings 3 description",
      title:
        "Settings 3 is a longer title, in fact, much longer than the others",
      content:
        "Here is the content for settings 3 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec tincidunt pulvinar orci ut sagittis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Integer congue magna eget eleifend sagittis. Fusce consequat facilisis semper. Mauris luctus justo non diam finibus scelerisque sit amet eu ipsum. Aliquam faucibus, orci eu malesuada cursus, tortor neque feugiat risus, nec suscipit urna velit sit amet risus. Nullam ut neque et enim euismod malesuada a condimentum magna. Sed mattis dapibus lectus, a egestas lectus ullamcorper eget. Nulla at neque vestibulum, bibendum arcu eget, rutrum tortor. In hac habitasse platea dictumst. Quisque pulvinar iaculis pulvinar. Donec blandit nunc at ultrices commodo. Aenean non molestie neque."
    }
  ];
  return (
    <GridContainer className="status-buttons container">
      <Grid row>
        <Grid col={12}>
          <h2>Status Buttons</h2>
          <StatusButton type="inprogress" />
          <StatusButton type="complete" />
          <StatusButton type="provisional" />
          <StatusButton type="final" />
          <StatusButton type="notstarted" />
        </Grid>
      </Grid>
      <Grid row>
        <Grid col={12}>
          <h2>Regular Buttons</h2>
          <Button>Submit</Button>
          <Button className="hollow">Save</Button>
        </Grid>
      </Grid>
      <Grid row>
        <Grid col={12}>
          <h2>Icons</h2>
          PDF <FontAwesomeIcon icon={faFilePdf} /> <br />
          Arrow Left <FontAwesomeIcon icon={faArrowLeft} />
          <br />
          Arrow Right <FontAwesomeIcon icon={faArrowRight} />
        </Grid>
      </Grid>
      <Grid row>
        <Grid col={12}>
          <h2>Alerts</h2>
          <Alert type="success" heading="Success status">
            Success Message contents
          </Alert>
          <Alert type="warning" heading="Warning status">
            Warning Message contents
          </Alert>
          <Alert type="error" heading="Error status">
            Error Message contents
          </Alert>
          <Alert type="info" heading="Info status">
            Info Message contents
          </Alert>
        </Grid>
      </Grid>
      <Grid row>
        <Grid col={12}>
          <h2>Tabs</h2>
          <TabContainer />
        </Grid>
        <Grid row>
          <Grid col={12}>
            <h2>Accordion / FAQ's</h2>
            <Accordion bordered={true} items={accordionItems} />
          </Grid>
        </Grid>
      </Grid>
    </GridContainer>
  );
};

export default Example;
