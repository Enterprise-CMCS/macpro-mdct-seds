import React from "react";
import StatusButton from "./StatusButton";
import {
  Accordion,
  Alert,
  Button,
  Grid,
  GridContainer,
} from "@trussworks/react-uswds";

// FontAwesome / Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faArrowLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

// Tabs
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";

const Example = () => {
  let accordionItems = [
    {
      id: 1,
      description: "Settings description",
      title: "Settings 1",
      content: "Here is the content",
    },
    {
      id: 2,
      description: "Settings 2 description",
      title: "Settings 2",
      content: "Here is the content for settings 2",
    },
    {
      id: 3,
      description: "Settings 3 description",
      title:
        "Settings 3 is a longer title, in fact, much longer than the others",
      content:
        "Here is the content for settings 3 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec tincidunt pulvinar orci ut sagittis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Integer congue magna eget eleifend sagittis. Fusce consequat facilisis semper. Mauris luctus justo non diam finibus scelerisque sit amet eu ipsum. Aliquam faucibus, orci eu malesuada cursus, tortor neque feugiat risus, nec suscipit urna velit sit amet risus. Nullam ut neque et enim euismod malesuada a condimentum magna. Sed mattis dapibus lectus, a egestas lectus ullamcorper eget. Nulla at neque vestibulum, bibendum arcu eget, rutrum tortor. In hac habitasse platea dictumst. Quisque pulvinar iaculis pulvinar. Donec blandit nunc at ultrices commodo. Aenean non molestie neque.",
    },
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
          <Tabs>
            <TabList>
              <Tab>Under Age 0</Tab>
              <Tab disabled>Ages 0 -1</Tab>
              <Tab>Ages 1 - 5</Tab>
              <Tab>Ages 6 - 12</Tab>
              <Tab>Ages 13 - 18</Tab>
              <Tab>Summary</Tab>
            </TabList>

            <TabPanel>
              <p>
                <b>Under Age 0</b> (
                <i>Japanese: マリオ Hepburn: Mario, [ma.ɾʲi.o]</i>) (
                <i>English: /ˈmɑːrioʊ/; Italian: [ˈmaːrjo]</i>) is a fictional
                character in the Mario video game franchise, owned by Nintendo
                and created by Japanese video game designer Shigeru Miyamoto.
                Serving as the company's mascot and the eponymous protagonist of
                the series, Mario has appeared in over 200 video games since his
                creation. Depicted as a short, pudgy, Italian plumber who
                resides in the Mushroom Kingdom, his adventures generally center
                upon rescuing Princess Peach from the Koopa villain Bowser. His
                younger brother and sidekick is Luigi.
              </p>
              <p>
                Source:{" "}
                <a
                  href="https://en.wikipedia.org/wiki/Mario"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Wikipedia
                </a>
              </p>
            </TabPanel>
            <TabPanel>
              <p>
                <b>Ages 0 -1</b> (
                <i>Japanese: ルイージ Hepburn: Ruīji, [ɾɯ.iː.dʑi̥]</i>) (
                <i>English: /luˈiːdʒi/; Italian: [luˈiːdʒi]</i>) is a fictional
                character featured in video games and related media released by
                Nintendo. Created by prominent game designer Shigeru Miyamoto,
                Luigi is portrayed as the slightly younger but taller fraternal
                twin brother of Nintendo's mascot Mario, and appears in many
                games throughout the Mario franchise, often as a sidekick to his
                brother.
              </p>
              <p>
                Source:{" "}
                <a
                  href="https://en.wikipedia.org/wiki/Luigi"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Wikipedia
                </a>
              </p>
            </TabPanel>
            <TabPanel>
              <p>
                <b>Ages 1 - 5</b> (
                <i>Japanese: ピーチ姫 Hepburn: Pīchi-hime, [piː.tɕi̥ çi̥.me]</i>)
                is a character in Nintendo's Mario franchise. Originally created
                by Shigeru Miyamoto, Peach is the princess of the fictional
                Mushroom Kingdom, which is constantly under attack by Bowser.
                She often plays the damsel in distress role within the series
                and is the lead female. She is often portrayed as Mario's love
                interest and has appeared in Super Princess Peach, where she is
                the main playable character.
              </p>
              <p>
                Source:{" "}
                <a
                  href="https://en.wikipedia.org/wiki/Princess_Peach"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Wikipedia
                </a>
              </p>
            </TabPanel>
            <TabPanel>
              <p>
                <b>Ages 6 - 12</b> (<i>ヨッシー Yosshī, [joɕ.ɕiː]</i>) (
                <i>English: /ˈjoʊʃi/ or /ˈjɒʃi/</i>), once romanized as Yossy,
                is a fictional anthropomorphic dinosaur who appears in video
                games published by Nintendo. Yoshi debuted in Super Mario World
                (1990) on the Super Nintendo Entertainment System as Mario and
                Luigi's sidekick. Yoshi later starred in platform and puzzle
                games, including Super Mario World 2: Yoshi's Island, Yoshi's
                Story and Yoshi's Woolly World. Yoshi also appears in many of
                the Mario spin-off games, including Mario Party and Mario Kart,
                various Mario sports games, and Nintendo's crossover fighting
                game series Super Smash Bros. Yoshi belongs to the species of
                the same name, which is characterized by their variety of
                colors.
              </p>
              <p>
                Source:{" "}
                <a
                  href="https://en.wikipedia.org/wiki/Yoshi"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Wikipedia
                </a>
              </p>
            </TabPanel>
            <TabPanel>
              <p>
                <b>Ages 13 - 18</b> (<i>Japanese: キノピオ Hepburn: Kinopio</i>)
                is a fictional character who primarily appears in Nintendo's
                Mario franchise. Created by Japanese video game designer Shigeru
                Miyamoto, he is portrayed as a citizen of the Mushroom Kingdom
                and is one of Princess Peach's most loyal attendants; constantly
                working on her behalf. He is usually seen as a non-player
                character (NPC) who provides assistance to Mario and his friends
                in most games, but there are times when Toad(s) takes center
                stage and appears as a protagonist, as seen in Super Mario Bros.
                2, Wario's Woods, Super Mario 3D World, and Captain Toad:
                Treasure Tracker.
              </p>
              <p>
                Source:{" "}
                <a
                  href="https://en.wikipedia.org/wiki/Toad_(Nintendo)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Wikipedia
                </a>
              </p>
            </TabPanel>
            <TabPanel>
              <p>
                <b>Sumary</b> Summary
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
                nunc ipsum, tincidunt eget gravida in, porttitor eu nisi. Nunc
                vel dapibus arcu. Nullam posuere pretium nisi id feugiat.
                Suspendisse ut mi at enim ornare feugiat. Morbi sed mauris
                euismod, varius eros quis, maximus augue. Integer congue felis
                eu molestie volutpat. Nunc scelerisque velit vel ex egestas, vel
                laoreet velit aliquet. Nunc facilisis quam eget dui viverra
                suscipit. Nullam imperdiet tincidunt dui, vitae mattis quam. Nam
                sodales velit vitae neque aliquet, et ullamcorper nisi
                tristique. Suspendisse eget diam laoreet, rutrum augue vitae,
                laoreet nisl. Integer posuere vitae metus non placerat.
              </p>
            </TabPanel>
          </Tabs>
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
