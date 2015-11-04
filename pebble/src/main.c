#include <pebble.h>

static Window *s_window;
static TextLayer *s_text_layer;

static char s_text_buffer[64];

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

  // update s_text_buffer
  tuple = dict_find(iter, APP_KEY_TEXT);
  if (tuple) {
    snprintf(s_text_buffer, sizeof(s_text_buffer), "%s", tuple->value->cstring);
    text_layer_set_text(s_text_layer, s_text_buffer);
  }

  // quit the app
  tuple = dict_find(iter, APP_KEY_QUIT);
  if (tuple) {
    window_stack_pop_all(false);
  }
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  s_text_layer = text_layer_create(grect_inset(bounds, GEdgeInsets(30, 3)));
  text_layer_set_text(s_text_layer, "Loading...");
  text_layer_set_text_alignment(s_text_layer, GTextAlignmentCenter);
  text_layer_set_background_color(s_text_layer, GColorClear);
  text_layer_set_text_color(s_text_layer, GColorCeleste);
  text_layer_set_font(s_text_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));
  layer_add_child(window_layer, text_layer_get_layer(s_text_layer));

#if defined(PBL_ROUND)
  text_layer_enable_screen_text_flow_and_paging(s_text_layer, 5);
#endif
}

static void window_unload(Window *window) {
  text_layer_destroy(s_text_layer);
}

static void init(void) {
  s_window = window_create();
  window_set_background_color(s_window, GColorCobaltBlue);
  window_set_window_handlers(s_window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  window_stack_push(s_window, false);

  app_message_register_inbox_received(in_received_handler);
  app_message_open(256, 256);
}

static void deinit(void) {
  window_destroy(s_window);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}
