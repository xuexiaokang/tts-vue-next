// @vitest-environment happy-dom

import { describe, expect, test } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent } from "vue";
import i18n from "../../plugins/i18n";
import { useTtsStore } from "../../stores/tts";

const passthroughStub = defineComponent({
  inheritAttrs: false,
  template: '<div v-bind="$attrs"><slot /></div>',
});

const iconStub = defineComponent({
  inheritAttrs: false,
  template: '<i v-bind="$attrs"><slot /></i>',
});

const textareaStub = defineComponent({
  inheritAttrs: false,
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  template:
    '<textarea v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
});

const buttonStub = defineComponent({
  inheritAttrs: false,
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["click"],
  template:
    '<button v-bind="$attrs" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
});

const transitionStub = defineComponent({
  template: "<div><slot /></div>",
});

async function mountTextInput(initialText = "", converting = false) {
  const pinia = createPinia();
  setActivePinia(pinia);
  i18n.global.locale.value = "en";

  const store = useTtsStore();
  store.$patch({
    text: initialText,
    converting,
  });

  const { default: TextInput } = await import("./TextInput.vue");
  const wrapper = mount(TextInput, {
    global: {
      plugins: [pinia, i18n],
      stubs: {
        VCard: passthroughStub,
        VCardItem: passthroughStub,
        VCardText: passthroughStub,
        VAvatar: passthroughStub,
        VIcon: iconStub,
        VTextarea: textareaStub,
        VBtn: buttonStub,
        VFadeTransition: transitionStub,
      },
    },
  });

  return { wrapper, store };
}

describe("TextInput", () => {
  test("renders input panel and hides clear icon when text is empty", async () => {
    const { wrapper } = await mountTextInput();

    expect(wrapper.find(".text-panel.glass-panel").exists()).toBe(true);
    expect(wrapper.find("textarea").exists()).toBe(true);
    expect(wrapper.find('[aria-label="Clear text input"]').exists()).toBe(
      false,
    );
  });

  test("shows clear icon after input and updates store", async () => {
    const { wrapper, store } = await mountTextInput();

    await wrapper.find("textarea").setValue("Fresh script");

    expect(store.text).toBe("Fresh script");
    const clearButton = wrapper.find('[aria-label="Clear text input"]');
    expect(clearButton.exists()).toBe(true);
    expect(clearButton.attributes("icon")).toBe("mdi-delete-outline");
  });

  test("clears text when clear icon is clicked", async () => {
    const { wrapper, store } = await mountTextInput("Need clear", false);

    await wrapper.find('[aria-label="Clear text input"]').trigger("click");

    expect(store.text).toBe("");
    expect(wrapper.find('[aria-label="Clear text input"]').exists()).toBe(
      false,
    );
  });

  test("disables clear icon while a conversion is running", async () => {
    const { wrapper } = await mountTextInput("hello", true);

    expect(
      wrapper.find('[aria-label="Clear text input"]').attributes("disabled"),
    ).toBeDefined();
  });
});
