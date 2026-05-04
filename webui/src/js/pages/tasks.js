const { api, ElementPlus, Vue, monaco } = window;

let monacoInitialized = false;

const TASK_FORM_GROUPS = [
  {
    name: 'power',
    title: '体力与副本',
    keys: [
      'power_enable', 'power_plan', 'instance_type', 'calyx_golden_preference',
      'instance_names', 'instance_names_challenge_count', 'tp_before_instance',
      'break_down_level_four_relicset', 'merge_immersifier', 'merge_immersifier_limit',
      'use_reserved_trailblaze_power', 'use_fuel', 'echo_of_war_enable',
      'echo_of_war_timestamp', 'echo_of_war_start_day_of_week',
      'build_target_enable', 'build_target_scheme', 'build_target_ornament_weekly_count',
      'build_target_use_user_instance_when_only_erosion_and_ornament'
    ]
  },
  {
    name: 'team',
    title: '队伍配置',
    keys: ['instance_team_enable', 'instance_team_number', 'instance_teams']
  },
  {
    name: 'borrow',
    title: '支援角色',
    keys: ['borrow_enable', 'borrow_character_enable', 'borrow_friends', 'borrow_scroll_times']
  },
  {
    name: 'reward',
    title: '奖励领取',
    keys: [
      'reward_enable', 'reward_dispatch_enable', 'reward_mail_enable', 'reward_assist_enable',
      'reward_quest_enable', 'reward_srpass_enable', 'reward_redemption_code_enable',
      'reward_achievement_enable', 'reward_message_enable'
    ]
  },
  {
    name: 'daily',
    title: '日常任务',
    keys: ['daily_enable', 'daily_material_enable', 'daily_himeko_try_enable']
  },
  {
    name: 'activity',
    title: '活动',
    keys: ['activity_enable']
  },
  {
    name: 'ocr',
    title: 'OCR 加速',
    keys: ['ocr_gpu_acceleration']
  },
  {
    name: 'notify',
    title: '消息推送',
    keys: ['notification_enable']
  }
];

const NOTIFY_PROVIDERS = [
  { name: 'telegram', title: 'Telegram', keys: ['enable', 'token', 'userid', 'api_url', 'proxies'] },
  { name: 'matrix', title: 'Matrix', keys: ['enable', 'homeserver', 'device_id', 'user_id', 'access_token', 'room_id', 'proxy', 'separately_text_media'] },
  { name: 'serverchanturbo', title: 'Server酱 Turbo', keys: ['enable', 'sctkey', 'channel', 'openid'] },
  { name: 'serverchan3', title: 'Server酱 3', keys: ['enable', 'sendkey'] },
  { name: 'bark', title: 'Bark', keys: ['enable', 'key', 'group', 'icon', 'isarchive', 'sound', 'url', 'copy', 'autocopy', 'cipherkey', 'ciphermethod'] },
  { name: 'smtp', title: 'SMTP', keys: ['enable', 'host', 'user', 'password', 'From', 'To', 'port', 'ssl', 'starttls', 'ssl_unverified'] },
  { name: 'onebot', title: 'OneBot', keys: ['enable', 'endpoint', 'token', 'user_id', 'group_id'] },
  { name: 'gocqhttp', title: 'Go-cqhttp', keys: ['enable', 'endpoint', 'message_type', 'token', 'user_id', 'group_id'] },
  { name: 'dingtalk', title: '钉钉', keys: ['enable', 'token', 'secret'] },
  { name: 'pushplus', title: 'Pushplus', keys: ['enable', 'token', 'channel', 'webhook', 'callbackUrl'] },
  { name: 'wechatworkapp', title: '企业微信应用', keys: ['enable', 'corpid', 'corpsecret', 'agentid', 'touser', 'base_url'] },
  { name: 'wechatworkbot', title: '企业微信机器人', keys: ['enable', 'key', 'webhook_url'] },
  { name: 'gotify', title: 'Gotify', keys: ['enable', 'url', 'token', 'priority'] },
  { name: 'discord', title: 'Discord', keys: ['enable', 'webhook', 'username', 'avatar_url', 'color'] },
  { name: 'pushdeer', title: 'Pushdeer', keys: ['enable', 'token', 'url'] },
  { name: 'lark', title: '飞书', keys: ['enable', 'webhook', 'content', 'keyword', 'sign', 'imageenable', 'appid', 'secret'] },
  { name: 'kook', title: 'KOOK', keys: ['enable', 'token', 'target_id', 'chat_type'] },
  { name: 'webhook', title: 'Webhook', keys: ['enable', 'url', 'method', 'headers', 'body'] },
  { name: 'custom', title: '自定义通知', keys: ['enable', 'url', 'method', 'datatype', 'image', 'data'] },
  { name: 'meow', title: 'MeoW', keys: ['enable', 'nickname'] }
];

const Tasks = {
  template: `
    <div class="h-full flex flex-col space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 m-0">任务配置</h2>
          <p class="text-slate-500 dark:text-slate-400 mt-1">简洁模式编辑常用项，高级模式直接编辑 YAML，二者会在保存前实时同步。</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <div class="bg-white/80 dark:bg-slate-800/60 rounded-xl p-1 border border-slate-200 dark:border-white/5 flex items-center shadow-lg backdrop-blur-md">
            <el-select v-model="selectedAccount" placeholder="全局配置 (Global)" @change="loadConfig" clearable class="!bg-transparent custom-el-select w-64">
              <el-option label="全局配置 (Global)" value=""></el-option>
              <el-option
                v-for="acc in accounts"
                :key="acc.id"
                :label="acc.name + ' (覆盖配置)'"
                :value="acc.id">
              </el-option>
            </el-select>
          </div>
          <div class="bg-white/80 dark:bg-slate-800/60 rounded-xl p-1 border border-slate-200 dark:border-white/5 flex items-center shadow-lg backdrop-blur-md">
            <button @click="setMode('simple')" :class="modeButtonClass('simple')">简洁模式</button>
            <button @click="setMode('advanced')" :class="modeButtonClass('advanced')">高级模式</button>
          </div>
          <button @click="saveConfig" :disabled="saving || !!parseError" class="bg-violet-600 hover:bg-violet-500 disabled:bg-slate-500 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-xl transition-all shadow-[0_0_15px_-3px_rgba(139,92,246,0.5)] flex items-center">
            <el-icon v-if="saving" class="is-loading mr-2"><Loading /></el-icon>
            <el-icon v-else class="mr-2"><Check /></el-icon>
            {{ saving ? 'Saving...' : '保存配置' }}
          </button>
        </div>
      </div>

      <el-alert v-if="parseError" type="error" :closable="false" show-icon class="config-alert">
        <template #title>YAML 解析失败：{{ parseError }}</template>
      </el-alert>

      <div class="card-glass flex-1 relative overflow-hidden flex flex-col group min-h-[620px]">
        <div class="absolute -bottom-20 -left-20 w-72 h-72 bg-violet-600/10 rounded-full blur-[60px] pointer-events-none transition-all group-hover:bg-violet-600/20"></div>

        <div class="px-4 py-2 header-glass flex items-center justify-between z-10">
          <div class="flex gap-2">
            <div class="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div class="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div class="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>
          <span class="text-xs text-slate-500 font-mono">
            {{ selectedAccount ? 'account_override.yaml' : 'config.yaml' }} · {{ mode === 'simple' ? 'form' : 'yaml' }}
          </span>
        </div>

        <div v-show="mode === 'simple'" class="relative flex-1 z-10 overflow-y-auto custom-scrollbar p-4 md:p-6">
          <el-skeleton v-if="loading" :rows="8" animated />
          <el-collapse v-else v-model="activeGroups" class="config-collapse">
            <el-collapse-item v-for="group in formGroups" :key="group.name" :name="group.name">
              <template #title>
                <div class="config-group-title">
                  <span>{{ group.title }}</span>
                  <el-switch
                    v-if="isAccountMode"
                    :model-value="isGroupOverrideEnabled(group)"
                    @click.stop
                    @change="setGroupOverride(group, $event)"
                    inline-prompt
                    active-text="覆盖"
                    inactive-text="继承" />
                </div>
              </template>

              <div v-if="isGroupMounted(group.name)" :class="['config-section-body', { 'config-section-disabled': isAccountMode && !isGroupOverrideEnabled(group) }]">
                <template v-if="group.name === 'power'">
                  <div class="text-xs text-slate-500 mb-4 px-1 italic">优先级由上向下递减</div>
                  
                  <el-collapse class="nested-collapse" v-model="activePowerPanels">
                    <!-- 历战余响配置 -->
                    <el-collapse-item name="war" title="历战余响">
                      <div v-if="isPowerPanelMounted('war')" class="config-grid">
                        <switch-field label="启用优先历战余响" tip="启用后，会优先使用体力完成3次「历战余响」" :value="fieldValue('echo_of_war_enable')" :disabled="isGroupDisabled(group)" @change="setField('echo_of_war_enable', $event)" />
                        <select-field label="开始日" :value="numberField('echo_of_war_start_day_of_week', 1)" :options="weekDayOptions" :disabled="isGroupDisabled(group)" @change="setField('echo_of_war_start_day_of_week', $event)" />
                      </div>
                    </el-collapse-item>

                    <!-- 体力计划 -->
                    <el-collapse-item name="plan" title="体力计划">
                      <div v-if="isPowerPanelMounted('plan')" class="config-list">
                        <div v-for="(plan, index) in powerPlans" :key="'plan-' + index" class="config-list-row">
                          <el-select :model-value="plan[0]" @update:model-value="setPowerPlanType(index, $event)" :disabled="isGroupDisabled(group)" filterable class="min-w-[150px]">
                            <el-option v-for="item in instanceTypeOptions(false)" :key="item.value" :label="item.label" :value="item.value" />
                          </el-select>
                          <el-select :model-value="plan[1]" @update:model-value="setPowerPlanName(index, $event)" :disabled="isGroupDisabled(group)" filterable class="flex-1 min-w-[220px]">
                            <el-option v-for="item in instanceNameOptions(plan[0], false)" :key="item.value" :label="item.label" :value="item.value" />
                          </el-select>
                          <el-input-number :model-value="plan[2] || 1" @update:model-value="setPowerPlanCount(index, $event)" :min="1" :max="999" :disabled="isGroupDisabled(group)" />
                          <el-button :disabled="index === 0 || isGroupDisabled(group)" @click="movePowerPlanUp(index)">
                            <el-icon><Top /></el-icon><span>上移</span>
                          </el-button>
                          <el-button :disabled="isGroupDisabled(group)" @click="removePowerPlan(index)" type="danger" plain>
                            <el-icon><Delete /></el-icon><span>删除</span>
                          </el-button>
                        </div>
                        <el-button :disabled="powerPlans.length >= 8 || isGroupDisabled(group)" @click="addPowerPlan" type="primary" plain>
                          <el-icon><Plus /></el-icon><span>添加计划</span>
                        </el-button>
                      </div>
                    </el-collapse-item>

                    <!-- 清体力配置 -->
                    <el-collapse-item name="names" title="清体力">
                      <div v-if="isPowerPanelMounted('names')">
                        <div class="text-xs text-slate-500 mb-4 px-1 italic">如果启用培养目标，其优先级高于设置的副本</div>
                        
                        <div class="config-grid mb-6">
                          <switch-field label="启用清体力" :value="fieldValue('power_enable')" :disabled="isGroupDisabled(group)" @change="setField('power_enable', $event)" />
                          <select-field label="副本类型" :value="fieldValue('instance_type')" :options="instanceTypeOptions(false)" :disabled="isGroupDisabled(group)" @change="setInstanceType($event)" />
                          <select-field label="副本名称" :value="instanceNameValue(fieldValue('instance_type'))" :options="instanceNameOptions(fieldValue('instance_type'), true)" :disabled="isGroupDisabled(group)" @change="setInstanceName(fieldValue('instance_type'), $event)" />
                          <select-field label="拟造花萼（金）偏好地区" :value="fieldValue('calyx_golden_preference')" :options="calyxOptions" :disabled="isGroupDisabled(group)" @change="setField('calyx_golden_preference', $event)" />
                        </div>

                        <!-- 培养目标移动至此处 -->
                        <div class="border-t border-slate-200 dark:border-slate-800/60 pt-6 mb-6">
                          <div class="config-grid">
                            <switch-field label="启用培养目标" :value="fieldValue('build_target_enable')" :disabled="isGroupDisabled(group)" @change="setField('build_target_enable', $event)" />
                            <select-field label="识别方案" :value="fieldValue('build_target_scheme')" :options="buildTargetSchemeOptions" :disabled="isGroupDisabled(group)" @change="setField('build_target_scheme', $event)" />
                            <number-field label="每周饰品提取次数" :value="numberField('build_target_ornament_weekly_count', 0)" :min="0" :max="7" :disabled="isGroupDisabled(group)" @change="setField('build_target_ornament_weekly_count', $event)" />
                            <switch-field label="仅识别到侵蚀隧洞/饰品提取时使用上方副本" :value="fieldValue('build_target_use_user_instance_when_only_erosion_and_ornament')" :disabled="isGroupDisabled(group)" @change="setField('build_target_use_user_instance_when_only_erosion_and_ornament', $event)" />
                          </div>
                        </div>

                        <div class="config-grid border-t border-slate-200 dark:border-slate-800/60 pt-6">
                          <switch-field label="清体力前传送至任意锚点" :value="fieldValue('tp_before_instance')" :disabled="isGroupDisabled(group)" @change="setField('tp_before_instance', $event)" />
                          <switch-field label="使用后备开拓力" :value="fieldValue('use_reserved_trailblaze_power')" :disabled="isGroupDisabled(group)" @change="setField('use_reserved_trailblaze_power', $event)" />
                          <switch-field label="使用燃料" :value="fieldValue('use_fuel')" :disabled="isGroupDisabled(group)" @change="setField('use_fuel', $event)" />
                        </div>
                        <div class="config-grid border-t border-slate-200 dark:border-slate-800/60 pt-6 mt-6">
                          <switch-field label="优先合成沉浸器" tip="优先级高于上方清体力设置" :value="fieldValue('merge_immersifier')" :disabled="isGroupDisabled(group)" @change="setField('merge_immersifier', $event)" />
                          <number-field label="沉浸器上限" :value="numberField('merge_immersifier_limit', 12)" :min="0" :max="99" :disabled="isGroupDisabled(group)" @change="setField('merge_immersifier_limit', String($event))" />
                        </div>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </template>

                <template v-else-if="group.name === 'team'">
                  <div class="config-grid">
                    <switch-field label="自动切换队伍" :value="fieldValue('instance_team_enable')" :disabled="isGroupDisabled(group)" @change="setField('instance_team_enable', $event)" />
                    <number-field label="默认队伍编号" :value="numberField('instance_team_number', 6)" :min="1" :max="12" :disabled="isGroupDisabled(group)" @change="setField('instance_team_number', String($event))" />
                  </div>
                  <div class="config-list mt-4">
                    <div v-for="(rule, index) in instanceTeams" :key="'team-rule-' + index" class="config-list-row">
                      <el-select :model-value="rule.instance_name" @update:model-value="setInstanceTeamName(index, $event)" :disabled="isGroupDisabled(group)" filterable class="flex-1 min-w-[260px]">
                        <el-option v-for="item in flatInstanceOptions" :key="item.name" :label="item.label" :value="item.name" />
                      </el-select>
                      <el-input-number :model-value="Number(rule.team_number || 6)" @update:model-value="setInstanceTeamNumber(index, $event)" :min="1" :max="12" :disabled="isGroupDisabled(group)" />
                      <el-button :disabled="isGroupDisabled(group)" @click="removeInstanceTeam(index)" type="danger" plain>
                        <el-icon><Delete /></el-icon><span>删除</span>
                      </el-button>
                    </div>
                    <el-button :disabled="isGroupDisabled(group)" @click="addInstanceTeam" type="primary" plain>
                      <el-icon><Plus /></el-icon><span>添加规则</span>
                    </el-button>
                  </div>
                </template>

                <template v-else-if="group.name === 'borrow'">
                  <div class="config-grid">
                    <switch-field label="启用使用支援角色" :value="fieldValue('borrow_enable')" :disabled="isGroupDisabled(group)" @change="setField('borrow_enable', $event)" />
                    <switch-field label="强制使用支援角色" tip="无论何时都要使用支援角色，即使日常实训中的要求已经完成" :value="fieldValue('borrow_character_enable')" :disabled="isGroupDisabled(group)" @change="setField('borrow_character_enable', $event)" />
                    <number-field label="滚动查找次数" :value="numberField('borrow_scroll_times', 10)" :min="1" :max="10" :disabled="isGroupDisabled(group)" @change="setField('borrow_scroll_times', $event)" />
                  </div>
                  <div class="text-xs text-slate-500 mt-4 px-1 italic">左侧选择角色，右侧输入好友名称（可选）</div>
                  <div class="config-list mt-2">
                    <div v-for="(_, index) in 6" :key="'friend-' + index" class="config-list-row">
                      <span class="config-row-index">{{ index + 1 }}</span>
                      <el-select :model-value="borrowFriendAt(index)[0]" @update:model-value="setBorrowFriendCharacter(index, $event)" :disabled="isGroupDisabled(group)" filterable class="min-w-[220px]">
                        <el-option v-for="item in characterOptions" :key="item.value" :label="item.label" :value="item.value" />
                      </el-select>
                      <el-input :model-value="borrowFriendAt(index)[1]" @update:model-value="setBorrowFriendName(index, $event)" :disabled="isGroupDisabled(group)" placeholder="好友名称，可留空" class="flex-1 min-w-[220px]" />
                    </div>
                  </div>
                </template>

                <template v-else-if="group.name === 'reward'">
                  <div class="config-grid">
                    <switch-field v-for="item in rewardFields" :key="item.key" :label="item.label" :value="fieldValue(item.key)" :disabled="isGroupDisabled(group)" @change="setField(item.key, $event)" />
                  </div>
                </template>

                <template v-else-if="group.name === 'daily'">
                  <div class="config-grid">
                    <switch-field label="启用日常任务" :value="fieldValue('daily_enable')" :disabled="isGroupDisabled(group)" @change="setField('daily_enable', $event)" />
                    <switch-field label="通过合成材料完成任务" :value="fieldValue('daily_material_enable')" :disabled="isGroupDisabled(group)" @change="setField('daily_material_enable', $event)" />
                    <switch-field label="通过姬子试用完成任务" :value="fieldValue('daily_himeko_try_enable')" :disabled="isGroupDisabled(group)" @change="setField('daily_himeko_try_enable', $event)" />
                  </div>
                </template>

                <template v-else-if="group.name === 'activity'">
                  <div class="config-grid">
                    <switch-field label="启用活动功能" :value="fieldValue('activity_enable')" :disabled="isGroupDisabled(group)" @change="setField('activity_enable', $event)" />
                  </div>
                </template>

                <template v-else-if="group.name === 'ocr'">
                  <div class="config-grid">
                    <select-field label="OCR 加速模式" :value="fieldValue('ocr_gpu_acceleration')" :options="ocrOptions" :disabled="isGroupDisabled(group)" @change="setField('ocr_gpu_acceleration', $event)" />
                  </div>
                </template>

                <template v-else-if="group.name === 'notify'">
                  <div class="config-grid">
                    <switch-field label="启用消息推送" :value="fieldValue('notification_enable')" :disabled="isGroupDisabled(group)" @change="setField('notification_enable', $event)" />
                  </div>
                  <el-collapse class="nested-collapse mt-4" v-model="activeNotifyProviders">
                    <el-collapse-item v-for="provider in notifyProviders" :key="provider.name" :name="provider.name">
                      <template #title>
                        <div class="config-group-title">
                          <span>{{ provider.title }}</span>
                          <el-switch
                            v-if="isAccountMode"
                            :model-value="isProviderOverrideEnabled(provider)"
                            @click.stop
                            @change="setProviderOverride(provider, $event)"
                            inline-prompt
                            active-text="覆盖"
                            inactive-text="继承" />
                        </div>
                      </template>
                      <div v-if="isProviderMounted(provider.name)" :class="['config-grid', { 'config-section-disabled': isProviderDisabled(provider) }]">
                        <template v-for="field in providerFieldModels(provider)" :key="field.key">
                          <switch-field v-if="field.type === 'bool'" :label="field.label" :value="fieldValue(field.key)" :disabled="isProviderDisabled(provider)" @change="setField(field.key, $event)" />
                          <number-field v-else-if="field.type === 'number'" :label="field.label" :value="numberField(field.key, field.defaultValue || 0)" :min="field.min || 0" :max="field.max || 9999" :disabled="isProviderDisabled(provider)" @change="setField(field.key, $event)" />
                          <text-field v-else :label="field.label" :value="stringField(field.key)" :disabled="isProviderDisabled(provider)" @change="setField(field.key, $event)" />
                        </template>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </template>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>

        <div v-show="mode === 'advanced'" class="relative flex-1 w-full bg-[#1e1e1e] dark:bg-[#1e1e1e] z-10">
          <div v-if="editorLoading || editorError" class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-slate-950 text-slate-200">
            <el-icon v-if="editorLoading" class="is-loading text-2xl"><Loading /></el-icon>
            <div class="text-sm">{{ editorLoading ? '正在加载 YAML 编辑器...' : editorError }}</div>
            <el-button v-if="editorError" @click="setMode('simple')" type="primary" plain>返回简洁模式</el-button>
          </div>
          <div id="monaco-editor" class="absolute inset-0"></div>
        </div>
      </div>
    </div>
  `,
  components: {
    SwitchField: {
      props: ['label', 'value', 'disabled', 'tip'],
      emits: ['change'],
      template: `
        <label class="config-field config-field-switch">
          <span class="flex items-center">
            {{ label }}
            <el-tooltip v-if="tip" :content="tip" placement="top">
              <el-icon class="ml-1 text-slate-400 cursor-help"><InfoFilled /></el-icon>
            </el-tooltip>
          </span>
          <el-switch :model-value="!!value" :disabled="disabled" @update:model-value="$emit('change', $event)" />
        </label>
      `
    },
    SelectField: {
      props: ['label', 'value', 'options', 'disabled', 'tip'],
      emits: ['change'],
      template: `
        <label class="config-field">
          <span class="flex items-center">
            {{ label }}
            <el-tooltip v-if="tip" :content="tip" placement="top">
              <el-icon class="ml-1 text-slate-400 cursor-help"><InfoFilled /></el-icon>
            </el-tooltip>
          </span>
          <el-select :model-value="value" :disabled="disabled" @update:model-value="$emit('change', $event)" filterable class="w-full">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </label>
      `
    },
    NumberField: {
      props: ['label', 'value', 'min', 'max', 'disabled', 'tip'],
      emits: ['change'],
      template: `
        <label class="config-field">
          <span class="flex items-center">
            {{ label }}
            <el-tooltip v-if="tip" :content="tip" placement="top">
              <el-icon class="ml-1 text-slate-400 cursor-help"><InfoFilled /></el-icon>
            </el-tooltip>
          </span>
          <el-input-number :model-value="value" :min="min ?? 0" :max="max ?? 999999999" :disabled="disabled" @update:model-value="$emit('change', $event)" class="w-full" />
        </label>
      `
    },
    TextField: {
      props: ['label', 'value', 'disabled', 'tip'],
      emits: ['change'],
      template: `
        <label class="config-field">
          <span class="flex items-center">
            {{ label }}
            <el-tooltip v-if="tip" :content="tip" placement="top">
              <el-icon class="ml-1 text-slate-400 cursor-help"><InfoFilled /></el-icon>
            </el-tooltip>
          </span>
          <el-input :model-value="value" :disabled="disabled" @update:model-value="$emit('change', $event)" clearable />
        </label>
      `
    }
  },
  data() {
    return {
      accounts: [],
      selectedAccount: '',
      saving: false,
      loading: true,
      mode: 'simple',
      yamlText: '',
      configObject: {},
      globalYamlText: '',
      globalConfigObject: {},
      options: {
        instance_names: {},
        flat_instance_names: [],
        characters: []
      },
      parseError: '',
      editorLoading: false,
      editorError: '',
      suppressEditorChange: false,
      suppressFormRender: false,
      parseTimer: null,
      resumeScrollTimeout: null,
      activeGroups: ['power'],
      activePowerPanels: ['war', 'plan', 'names'],
      activeNotifyProviders: [],
      mountedGroups: ['power'],
      mountedPowerPanels: ['war', 'plan', 'names'],
      mountedNotifyProviders: [],
      weekDayOptions: [
        { value: 1, label: '周一' },
        { value: 2, label: '周二' },
        { value: 3, label: '周三' },
        { value: 4, label: '周四' },
        { value: 5, label: '周五' },
        { value: 6, label: '周六' },
        { value: 7, label: '周日' }
      ],
      formGroups: TASK_FORM_GROUPS,
      notifyProviders: NOTIFY_PROVIDERS
    }
  },
  computed: {
    isAccountMode() {
      return !!this.selectedAccount;
    },
    allInstanceTypes() {
      return Object.keys(this.options.instance_names || {});
    },
    flatInstanceOptions() {
      return this.options.flat_instance_names || [];
    },
    characterOptions() {
      return this.options.characters || [{ value: 'None', label: '无' }];
    },
    powerPlans() {
      return this.ensureArrayField('power_plan');
    },
    instanceTeams() {
      return this.ensureArrayField('instance_teams');
    },
    calyxOptions() {
      return [
        { label: '雅利洛-VI', value: 'Jarilo-VI' },
        { label: '仙舟「罗浮」', value: 'XianzhouLuofu' },
        { label: '匹诺康尼', value: 'Penacony' }
      ];
    },
    buildTargetSchemeOptions() {
      return [
        { label: '副本名称识别', value: 'instance' },
        { label: '掉落物识别', value: 'drop' }
      ];
    },
    ocrOptions() {
      return [
        { label: '自动', value: 'auto' },
        { label: 'GPU', value: 'gpu' },
        { label: 'ONNXRuntime + DirectML', value: 'onnx_dml' },
        { label: 'CPU', value: 'cpu' },
        { label: 'OpenVINO CPU', value: 'openvino_cpu' },
        { label: 'ONNXRuntime CPU', value: 'onnx_cpu' }
      ];
    },
    rewardFields() {
      return [
        { key: 'reward_enable', label: '启用领取奖励' },
        { key: 'reward_dispatch_enable', label: '领取委托奖励' },
        { key: 'reward_mail_enable', label: '领取邮件奖励' },
        { key: 'reward_assist_enable', label: '领取支援奖励' },
        { key: 'reward_quest_enable', label: '领取每日实训奖励' },
        { key: 'reward_srpass_enable', label: '领取无名勋礼奖励' },
        { key: 'reward_redemption_code_enable', label: '领取兑换码奖励' },
        { key: 'reward_achievement_enable', label: '领取成就奖励' },
        { key: 'reward_message_enable', label: '领取短信奖励' }
      ];
    }
  },
  watch: {
    activeGroups(value) {
      this.markMounted(this.mountedGroups, value);
    },
    activePowerPanels(value) {
      this.markMounted(this.mountedPowerPanels, value);
    },
    activeNotifyProviders(value) {
      this.markMounted(this.mountedNotifyProviders, value);
    }
  },
  async mounted() {
    await Promise.all([this.fetchAccounts(), this.fetchOptions()]);
    await this.loadGlobalReference();
    await this.loadConfig();
  },
  beforeUnmount() {
    if (this.parseTimer) clearTimeout(this.parseTimer);
    if (this.themeObserver) this.themeObserver.disconnect();
    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }
  },
  methods: {
    markMounted(store, value) {
      const names = Array.isArray(value) ? value : [value];
      names.filter(Boolean).forEach(name => {
        if (!store.includes(name)) store.push(name);
      });
    },
    isGroupMounted(name) {
      return this.mountedGroups.includes(name);
    },
    isPowerPanelMounted(name) {
      return this.mountedPowerPanels.includes(name);
    },
    isProviderMounted(name) {
      return this.mountedNotifyProviders.includes(name);
    },
    async ensureEditor() {
      if (this.editor) {
        this.$nextTick(() => this.editor.layout());
        return;
      }
      this.editorLoading = true;
      this.editorError = '';

      const initEditor = () => {
        const container = document.getElementById('monaco-editor');
        if (!container || this.editor) return;
        this.editor = Vue.markRaw(monaco.editor.create(container, {
          value: this.yamlText || '',
          language: 'yaml',
          theme: document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs',
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          renderLineHighlight: 'all',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on'
        }));
        this.editor.onDidChangeModelContent(() => {
          if (this.suppressEditorChange) return;
          this.yamlText = this.editor.getValue();
          this.debouncedParseYaml();
        });
        this.themeObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
              const isDark = document.documentElement.classList.contains('dark');
              monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
            }
          });
        });
        this.themeObserver.observe(document.documentElement, { attributes: true });
        this.editorLoading = false;
        this.$nextTick(() => this.editor.layout());
      };

      try {
        if (window.monaco && window.monaco.editor) {
          initEditor();
          return;
        }
        if (!monacoInitialized) {
          require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@0.45.0/min/vs' } });
          monacoInitialized = true;
        }
        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('YAML 编辑器加载超时，请检查网络或稍后重试')), 15000);
          require(['vs/editor/editor.main'], () => {
            clearTimeout(timer);
            initEditor();
            resolve();
          }, (err) => {
            clearTimeout(timer);
            reject(err);
          });
        });
      } catch (err) {
        this.editorLoading = false;
        this.editorError = err?.message || 'YAML 编辑器加载失败';
      }
    },
    async fetchAccounts() {
      try {
        this.accounts = await api.get('/accounts');
      } catch (err) {
        console.error(err);
      }
    },
    async fetchOptions() {
      try {
        this.options = await api.get('/config/options');
      } catch (err) {
        console.error(err);
        ElementPlus.ElMessage.error('加载表单选项失败');
      }
    },
    async loadGlobalReference() {
      try {
        const res = await api.get('/config');
        this.globalYamlText = res.content || '';
        const parsed = await api.post('/config/parse', { content: this.globalYamlText });
        this.globalConfigObject = parsed.config || {};
      } catch (err) {
        console.error(err);
        this.globalConfigObject = {};
      }
    },
    async loadConfig() {
      this.loading = true;
      this.parseError = '';
      try {
        await this.loadGlobalReference();
        if (!this.selectedAccount) {
          this.yamlText = this.globalYamlText;
        } else {
          const acc = this.accounts.find(a => a.id === this.selectedAccount);
          this.yamlText = acc?.config_override || '';
        }
        await this.parseYamlText(this.yamlText);
        if (this.editor) this.setEditorValue(this.yamlText);
      } catch (err) {
        console.error(err);
        ElementPlus.ElMessage.error('加载配置失败');
      } finally {
        this.loading = false;
      }
    },
    setEditorValue(value) {
      if (!this.editor) return;
      this.suppressEditorChange = true;
      this.editor.setValue(value || '');
      this.$nextTick(() => {
        this.suppressEditorChange = false;
      });
    },
    async parseYamlText(content) {
      const parsed = await api.post('/config/parse', { content: content || '' });
      this.configObject = parsed.config || {};
      this.parseError = '';
    },
    debouncedParseYaml() {
      if (this.parseTimer) clearTimeout(this.parseTimer);
      this.parseTimer = setTimeout(async () => {
        try {
          await this.parseYamlText(this.yamlText);
        } catch (err) {
          this.parseError = err.response?.data?.detail || err.message || '未知错误';
        }
      }, 450);
    },
    async renderYaml(values = {}, removeKeys = []) {
      if (this.suppressFormRender) return;
      try {
        const rendered = await api.post('/config/render', {
          content: this.yamlText || '',
          values,
          remove_keys: removeKeys
        });
        this.yamlText = rendered.content || '';
        this.configObject = rendered.config || {};
        this.parseError = '';
        this.setEditorValue(this.yamlText);
      } catch (err) {
        this.parseError = err.response?.data?.detail || err.message || '渲染失败';
        ElementPlus.ElMessage.error('同步 YAML 失败');
      }
    },
    modeButtonClass(target) {
      const active = this.mode === target;
      return [
        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
        active
          ? 'bg-violet-600 text-white shadow-sm'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/70'
      ];
    },
    async setMode(target) {
      if (target === 'simple' && this.parseError) {
        ElementPlus.ElMessage.error('请先修正 YAML 后再切换到简洁模式');
        return;
      }
      this.mode = target;
      if (target === 'advanced') {
        await this.$nextTick();
        await this.ensureEditor();
      } else {
        this.$nextTick(() => {
          if (this.editor) this.editor.layout();
        });
      }
    },
    ownConfigHas(key) {
      return Object.prototype.hasOwnProperty.call(this.configObject || {}, key);
    },
    defaultForKey(key) {
      const defaults = {
        power_plan: [],
        instance_names: {},
        instance_names_challenge_count: {},
        borrow_friends: [['None', ''], ['None', ''], ['None', ''], ['None', ''], ['None', ''], ['None', '']],
        instance_teams: []
      };
      if (Object.prototype.hasOwnProperty.call(defaults, key)) return this.clone(defaults[key]);
      if (key.endsWith('_enable') || key === 'tp_before_instance' || key === 'break_down_level_four_relicset' || key === 'use_reserved_trailblaze_power' || key === 'use_fuel') return false;
      return '';
    },
    fieldValue(key) {
      if (this.ownConfigHas(key)) return this.configObject[key];
      if (Object.prototype.hasOwnProperty.call(this.globalConfigObject || {}, key)) return this.globalConfigObject[key];
      return this.defaultForKey(key);
    },
    stringField(key) {
      const value = this.fieldValue(key);
      return value === null || value === undefined ? '' : String(value);
    },
    numberField(key, fallback = 0) {
      const value = Number(this.fieldValue(key));
      return Number.isFinite(value) ? value : fallback;
    },
    clone(value) {
      return JSON.parse(JSON.stringify(value ?? null));
    },
    async setField(key, value) {
      this.configObject[key] = value;
      await this.renderYaml({ [key]: value });
    },
    ensureArrayField(key) {
      const value = this.fieldValue(key);
      return Array.isArray(value) ? value : [];
    },
    instanceTypeOptions(includeEcho = true) {
      return this.allInstanceTypes
        .filter(type => includeEcho || type !== '历战余响')
        .map(type => ({ label: type, value: type }));
    },
    instanceNameOptions(type, includeNone = true) {
      const names = this.options.instance_names?.[type] || {};
      return Object.entries(names)
        .filter(([name]) => includeNone || name !== '无')
        .map(([name, description]) => ({
          value: name,
          label: description ? `${name}（${description}）` : name
        }));
    },
    firstInstanceName(type, includeNone = true) {
      return this.instanceNameOptions(type, includeNone)[0]?.value || '';
    },
    async setInstanceType(type) {
      const updates = { instance_type: type };
      this.configObject.instance_type = type;
      const names = this.clone(this.fieldValue('instance_names') || {});
      if (!names[type]) {
        names[type] = this.firstInstanceName(type, true);
        this.configObject.instance_names = names;
        updates.instance_names = names;
      }
      await this.renderYaml(updates);
    },
    instanceNameValue(type) {
      const names = this.fieldValue('instance_names') || {};
      return names[type] || this.firstInstanceName(type, true);
    },
    async setInstanceName(type, value) {
      const names = this.clone(this.fieldValue('instance_names') || {});
      names[type] = value;
      this.configObject.instance_names = names;
      await this.renderYaml({ instance_names: names });
    },
    instanceChallengeCountValue(type) {
      const counts = this.fieldValue('instance_names_challenge_count') || {};
      return Number(counts[type] || 1);
    },
    async setInstanceChallengeCount(type, value) {
      const counts = this.clone(this.fieldValue('instance_names_challenge_count') || {});
      counts[type] = value || 1;
      this.configObject.instance_names_challenge_count = counts;
      await this.renderYaml({ instance_names_challenge_count: counts });
    },
    normalizePowerPlans() {
      return this.clone(this.powerPlans);
    },
    async updatePowerPlans(plans) {
      this.configObject.power_plan = plans;
      await this.renderYaml({ power_plan: plans });
    },
    async addPowerPlan() {
      if (this.powerPlans.length >= 8) return;
      const type = this.allInstanceTypes.includes(this.fieldValue('instance_type')) && this.fieldValue('instance_type') !== '历战余响'
        ? this.fieldValue('instance_type')
        : this.instanceTypeOptions(false)[0]?.value;
      const plans = this.normalizePowerPlans();
      plans.push([type, this.firstInstanceName(type, false), 1]);
      await this.updatePowerPlans(plans);
    },
    async removePowerPlan(index) {
      const plans = this.normalizePowerPlans();
      plans.splice(index, 1);
      await this.updatePowerPlans(plans);
    },
    async movePowerPlanUp(index) {
      if (index <= 0) return;
      const plans = this.normalizePowerPlans();
      [plans[index - 1], plans[index]] = [plans[index], plans[index - 1]];
      await this.updatePowerPlans(plans);
    },
    async setPowerPlanType(index, type) {
      const plans = this.normalizePowerPlans();
      const currentName = plans[index]?.[1];
      const validNames = this.instanceNameOptions(type, false).map(item => item.value);
      plans[index] = [type, validNames.includes(currentName) ? currentName : this.firstInstanceName(type, false), plans[index]?.[2] || 1];
      await this.updatePowerPlans(plans);
    },
    async setPowerPlanName(index, name) {
      const plans = this.normalizePowerPlans();
      plans[index][1] = name;
      await this.updatePowerPlans(plans);
    },
    async setPowerPlanCount(index, count) {
      const plans = this.normalizePowerPlans();
      plans[index][2] = count || 1;
      await this.updatePowerPlans(plans);
    },
    normalizeBorrowFriends() {
      const friends = this.clone(this.fieldValue('borrow_friends') || []);
      while (friends.length < 6) friends.push(['None', '']);
      return friends.slice(0, 6).map(item => [item?.[0] || 'None', item?.[1] || '']);
    },
    borrowFriendAt(index) {
      const friends = this.fieldValue('borrow_friends');
      if (Array.isArray(friends) && friends[index]) {
        return [friends[index][0] || 'None', friends[index][1] || ''];
      }
      return ['None', ''];
    },
    async updateBorrowFriends(friends) {
      this.configObject.borrow_friends = friends;
      await this.renderYaml({ borrow_friends: friends });
    },
    async setBorrowFriendCharacter(index, value) {
      const friends = this.normalizeBorrowFriends();
      friends[index][0] = value || 'None';
      await this.updateBorrowFriends(friends);
    },
    async setBorrowFriendName(index, value) {
      const friends = this.normalizeBorrowFriends();
      friends[index][1] = value || '';
      await this.updateBorrowFriends(friends);
    },
    normalizeInstanceTeams() {
      return this.clone(this.instanceTeams).map(item => ({
        instance_name: item.instance_name || this.flatInstanceOptions[0]?.name || '',
        team_number: Number(item.team_number || this.fieldValue('instance_team_number') || 6)
      }));
    },
    async updateInstanceTeams(teams) {
      this.configObject.instance_teams = teams;
      await this.renderYaml({ instance_teams: teams });
    },
    async addInstanceTeam() {
      const teams = this.normalizeInstanceTeams();
      teams.push({ instance_name: this.flatInstanceOptions[0]?.name || '', team_number: Number(this.fieldValue('instance_team_number') || 6) });
      await this.updateInstanceTeams(teams);
    },
    async removeInstanceTeam(index) {
      const teams = this.normalizeInstanceTeams();
      teams.splice(index, 1);
      await this.updateInstanceTeams(teams);
    },
    async setInstanceTeamName(index, value) {
      const teams = this.normalizeInstanceTeams();
      teams[index].instance_name = value;
      await this.updateInstanceTeams(teams);
    },
    async setInstanceTeamNumber(index, value) {
      const teams = this.normalizeInstanceTeams();
      teams[index].team_number = value || 1;
      await this.updateInstanceTeams(teams);
    },
    isGroupOverrideEnabled(group) {
      if (!this.isAccountMode) return true;
      return group.keys.some(key => this.ownConfigHas(key));
    },
    isGroupDisabled(group) {
      return this.isAccountMode && !this.isGroupOverrideEnabled(group);
    },
    async setGroupOverride(group, enabled) {
      if (!this.isAccountMode) return;
      if (!enabled) {
        group.keys.forEach(key => delete this.configObject[key]);
        await this.renderYaml({}, group.keys);
        return;
      }
      const values = {};
      group.keys.forEach(key => {
        if (!this.ownConfigHas(key)) {
          const value = this.clone(this.fieldValue(key));
          this.configObject[key] = value;
          values[key] = value;
        }
      });
      await this.renderYaml(values);
    },
    notifyKey(provider, suffix) {
      return `notify_${provider.name}_${suffix}`;
    },
    providerKeys(provider) {
      return provider.keys.map(key => this.notifyKey(provider, key));
    },
    isProviderOverrideEnabled(provider) {
      if (!this.isAccountMode) return true;
      return this.providerKeys(provider).some(key => this.ownConfigHas(key));
    },
    isProviderDisabled(provider) {
      return this.isAccountMode && !this.isProviderOverrideEnabled(provider);
    },
    async setProviderOverride(provider, enabled) {
      if (!this.isAccountMode) return;
      const keys = this.providerKeys(provider);
      if (!enabled) {
        keys.forEach(key => delete this.configObject[key]);
        await this.renderYaml({}, keys);
        return;
      }
      const values = {};
      keys.forEach(key => {
        if (!this.ownConfigHas(key)) {
          const value = this.clone(this.fieldValue(key));
          this.configObject[key] = value;
          values[key] = value;
        }
      });
      await this.renderYaml(values);
    },
    providerFieldModels(provider) {
      const labels = {
        enable: '启用',
        token: 'Token',
        userid: '用户/群组 ID',
        api_url: '自定义 API 地址',
        proxies: '代理配置',
        homeserver: '服务器地址',
        device_id: '设备 ID',
        user_id: '私聊用户 ID',
        access_token: '访问令牌',
        room_id: '房间 ID',
        proxy: '代理配置',
        separately_text_media: '文字与图片分开发送',
        sctkey: 'SendKey',
        channel: '发送通道',
        openid: 'OpenID',
        sendkey: 'SendKey',
        key: 'Key',
        group: '分组名',
        icon: '图标地址',
        isarchive: '归档',
        sound: '提示音',
        url: '服务地址',
        copy: '复制内容',
        autocopy: '自动复制',
        cipherkey: '加密密钥',
        ciphermethod: '加密算法',
        host: 'SMTP 服务器',
        user: '用户名/邮箱',
        password: '密码/授权码',
        From: '发件人',
        To: '收件人',
        port: '端口',
        ssl: '启用 SSL',
        starttls: '启用 STARTTLS',
        ssl_unverified: '跳过证书验证',
        endpoint: '服务地址',
        message_type: '消息类型',
        group_id: '群组 ID',
        secret: '密钥',
        webhook: 'Webhook',
        webhook_url: 'Webhook URL',
        callbackUrl: '回调 URL',
        corpid: '企业 ID',
        corpsecret: '应用密钥',
        agentid: 'AgentId',
        touser: '目标用户',
        base_url: '自定义 API 地址',
        priority: '优先级',
        username: '用户名',
        avatar_url: '头像 URL',
        color: '颜色',
        content: '内容',
        keyword: '关键词',
        sign: '签名',
        imageenable: '启用图片信息发送',
        appid: 'AppId',
        target_id: '目标 ID',
        chat_type: '聊天类型',
        method: '请求方法',
        headers: '请求头',
        body: '请求体',
        datatype: '数据类型',
        image: '图片模板',
        data: '数据模板',
        nickname: '昵称'
      };
      const boolFields = new Set(['enable', 'ssl', 'starttls', 'ssl_unverified', 'separately_text_media', 'imageenable']);
      const numberFields = new Set(['priority']);
      return provider.keys.map(suffix => ({
        key: this.notifyKey(provider, suffix),
        label: labels[suffix] || suffix,
        type: boolFields.has(suffix) ? 'bool' : numberFields.has(suffix) ? 'number' : 'text',
        min: suffix === 'priority' ? 1 : 0,
        max: suffix === 'priority' ? 10 : 9999,
        defaultValue: suffix === 'priority' ? 3 : 0
      }));
    },
    async saveConfig() {
      if (this.parseError) {
        ElementPlus.ElMessage.error('请先修正 YAML 后再保存');
        return;
      }
      this.saving = true;
      const content = this.editor ? this.editor.getValue() : this.yamlText;
      try {
        await this.parseYamlText(content);
        if (!this.selectedAccount) {
          await api.post('/config', { content });
          this.globalYamlText = content;
          this.globalConfigObject = this.clone(this.configObject);
        } else {
          const acc = this.accounts.find(a => a.id === this.selectedAccount);
          acc.config_override = content;
          await api.put(`/accounts/${acc.id}`, acc);
        }
        ElementPlus.ElMessage.success('配置已保存');
      } catch (err) {
        this.parseError = err.response?.data?.detail || err.message || '保存失败';
        ElementPlus.ElMessage.error('保存失败');
      } finally {
        this.saving = false;
      }
    }
  }
};

window.Tasks = Tasks;
