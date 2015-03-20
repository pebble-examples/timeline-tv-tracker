#include <pebble.h>

static Window *window;
static TextLayer *text_layer;

static char text[64];

enum {
  APP_KEY_READY,
  APP_KEY_TEXT,
  APP_KEY_ACTION,
  APP_KEY_QUIT,
};

static void in_received_handler(DictionaryIterator *iter, void *context) {
  Tuple *tuple;

  // send the launch_arg when we receive ready from JS
  tuple = dict_find(iter, APP_KEY_READY);
  if (tuple) {
    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);
    dict_write_uint32(iter, APP_KEY_ACTION, launch_get_args());
    dict_write_end(iter);
    app_message_outbox_send();
  }

  // update text
  tuple = dict_find(iter, APP_KEY_TEXT);
  if (tuple) {
    snprintf(text, sizeof(text), "%s", tuple->value->cstring);
    text_layer_set_text(text_layer, text);
  }

  // quit the app
  tuple = dict_find(iter, APP_KEY_QUIT);
  if (tuple) {
    window_stack_pop_all(false);
  }
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);

  text_layer = text_layer_create(GRect(2, 32, 140, 120));
  text_layer_set_text(text_layer, "Loading...");
  text_layer_set_text_alignment(text_layer, GTextAlignmentCenter);
  text_layer_set_background_color(text_layer, GColorClear);
  text_layer_set_text_color(text_layer, GColorCeleste);
  text_layer_set_font(text_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));
  layer_add_child(window_layer, text_layer_get_layer(text_layer));
}

static void window_unload(Window *window) {
  text_layer_destroy(text_layer);
}

static void init(void) {
  window = window_create();
  window_set_fullscreen(window, true);
  window_set_background_color(window, GColorCobaltBlue);
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  window_stack_push(window, false);

  app_message_register_inbox_received(in_received_handler);
  app_message_open(256, 256);
}

static void deinit(void) {
  window_destroy(window);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}
