import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Event extends Document {
  @Prop()
  type: string;

  @Prop()
  name: string;

  @Prop({ type: Object })
  payload: Record<string, unknown>;
}

export const EventSchema = SchemaFactory.createForClass(Event);
