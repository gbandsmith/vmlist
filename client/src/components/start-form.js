import React, { Component } from 'react';
import axios from 'axios';
import { Control, Field } from 'react-bulma-components/lib/components/form'
import Button from 'react-bulma-components/lib/components/button';
import Section from 'react-bulma-components/lib/components/section';
import Notification from 'react-bulma-components/lib/components/notification';
import {  url } from '../actions'

class StartForm extends Component {
  state = {
    images: []
  }
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    axios.get(`${url}image`)
    .then((res) => {
      let images = res.data
      this.setState({ images });
    }).catch((err) => {
      console.log(err)
    })
  }

  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    var instance = {};
    data.forEach(function(value, key){
        instance[key] = value;
    });

    if (instance === {}) {
      return;
    }
    axios.post(`${url}image/start`, instance)
    .then((res) => {
      console.log(res)
    })
    //this.props.startInstance(instance);
    document.getElementById("add-instance-form").reset();
  }

render() {
  return (
    <div>
    <h3 className="title is-3">Start Instance</h3>
    <p>Start a new instance here !</p>
    <form id="add-instance-form" onSubmit={this.handleSubmit}>
      <Field>
        <Control>
          <div className="select">
            <select id="image" name="image">
              {
                this.state.images.map((item, key) =>
                <option key={key} value={item._id}>{item.name} ({item.description})</option>
              )
              }
            </select>
          </div>
        </Control>
        <Control>
          <input className="input"  id="name" name="name" placeholder="Instance Name" type="text" />
        </Control>
        <Control>
          <input className="input"  id="description" name="description" placeholder="Instance Description" type="text" />
        </Control>
      </Field>
      <Field>
        <Control>
          <Button>Start new instance</Button>
        </Control>
      </Field>
    </form>
    <Section>
      <Notification color="success">
        Done !
        <Button remove />
      </Notification>
      <Notification color="danger">
        Error !
        <Button remove />
      </Notification>
    </Section>

  </div>
  );
  }
}

export default StartForm;
