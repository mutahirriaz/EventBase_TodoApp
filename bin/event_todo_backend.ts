#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EventTodoBackendStack } from '../lib/event_todo_backend-stack';

const app = new cdk.App();
new EventTodoBackendStack(app, 'EventTodoBackendStack');
