require "new_admin/version"
require "new_admin/configuration"
require "new_admin/model_configuration"
require "new_admin/view_configuration"
require "new_admin/field_resolver"
require "new_admin/authorization/base"
require "new_admin/authorization/pundit_adapter"
require "new_admin/authorization/cancancan_adapter"
require "new_admin/authorization/block_adapter"
require "new_admin/column_config"
require "new_admin/association_config"
require "new_admin/model_config"
require "new_admin/introspector"
require "new_admin/engine"

module NewAdmin
  class AccessDenied < StandardError; end

  class << self
    def config
      @configuration ||= Configuration.new
      yield @configuration if block_given?
      @configuration
    end

    def configuration
      @configuration || Configuration.new
    end

    def reset_configuration!
      @configuration = nil
    end
  end
end
